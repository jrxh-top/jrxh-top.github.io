import type { APIRoute } from 'astro';
import { renderBrandEmail } from '../email-template';

// 这个文件只会在 astro dev 时通过 astro.config.mjs 注入，不会进入构建产物。
// prerender = false 让 dev 按需处理 POST，而不是把它当静态端点预渲染。
export const prerender = false;

const env = import.meta.env as unknown as Record<string, string | undefined>;
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '::1']);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    }
  });

const isLocalHost = (hostname: string) => LOCAL_HOSTS.has(hostname.replace(/^\[|\]$/g, ''));

const parseRecipients = (value: unknown) =>
  String(value ?? '')
    .split(/[\s,;]+/)
    .map((item) => item.trim())
    .filter(Boolean);

export const POST: APIRoute = async ({ request, url }) => {
  if (!isLocalHost(url.hostname)) {
    return json({ message: '仅允许通过 localhost 或 127.0.0.1 访问。' }, 403);
  }

  const origin = request.headers.get('origin');
  if (origin) {
    try {
      if (!isLocalHost(new URL(origin).hostname)) {
        return json({ message: '拒绝非本地来源的请求。' }, 403);
      }
    } catch {
      return json({ message: '请求来源无效。' }, 403);
    }
  }

  const apiKey = env.BREVO_API_KEY;
  if (!apiKey) {
    return json(
      { message: '未配置 BREVO_API_KEY，请在 jrxh-top/.env.local 中添加后重启 dev server。' },
      500
    );
  }

  let payload: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (!raw) {
      return json({ message: '请求体为空。' }, 400);
    }
    payload = JSON.parse(raw) as Record<string, unknown>;
  } catch (error) {
    return json(
      {
        message: `请求体不是合法 JSON：${error instanceof Error ? error.message : String(error)}`
      },
      400
    );
  }

  const to = parseRecipients(payload.to);
  const cc = parseRecipients(payload.cc);
  const bcc = parseRecipients(payload.bcc);
  const subject = String(payload.subject ?? '').trim();
  const body = String(payload.body ?? '');
  const format = payload.format === 'html' ? 'html' : 'text';
  const recipients = [...to, ...cc, ...bcc];

  if (!to.length) return json({ message: '请至少填写一个收件人。' }, 400);
  if (!recipients.every((email) => EMAIL_RE.test(email))) {
    return json({ message: '邮箱格式不正确，请检查收件人、抄送和密送。' }, 400);
  }
  if (recipients.length > 50) {
    return json({ message: '单次最多 50 个收件人。' }, 400);
  }
  if (!subject) return json({ message: '请填写邮件主题。' }, 400);
  if (subject.length > 200) return json({ message: '主题不能超过 200 个字符。' }, 400);
  if (!body.trim()) return json({ message: '请填写邮件正文。' }, 400);
  if (body.length > 200_000) return json({ message: '正文过长，请控制在 20 万字符以内。' }, 400);

  const senderName = env.BREVO_SENDER_NAME ?? 'Jrxh';
  const senderEmail = env.BREVO_SENDER_EMAIL ?? 'hello@jrxh.top';
  const rendered = renderBrandEmail({
    subject,
    body,
    bodyFormat: format,
    senderName,
    senderEmail
  });

  const brevoPayload: Record<string, unknown> = {
    sender: {
      email: senderEmail,
      name: senderName
    },
    to: to.map((email) => ({ email })),
    subject,
    htmlContent: rendered.html,
    textContent: rendered.text,
    tags: ['local-dev-mail'],
    ...(cc.length ? { cc: cc.map((email) => ({ email })) } : {}),
    ...(bcc.length ? { bcc: bcc.map((email) => ({ email })) } : {})
  };

  try {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        accept: 'application/json',
        'content-type': 'application/json'
      },
      body: JSON.stringify(brevoPayload),
      signal: AbortSignal.timeout(20_000)
    });

    const data = (await response.json().catch(() => null)) as
      | { messageId?: string; messageIds?: string[]; code?: string; message?: string }
      | null;

    if (!response.ok) {
      return json(
        {
          message: data?.message ?? `Brevo 返回 HTTP ${response.status}`,
          code: data?.code
        },
        response.status
      );
    }

    return json({
      messageId: data?.messageId ?? null,
      messageIds: data?.messageIds ?? null
    });
  } catch (error) {
    return json(
      {
        message: `请求 Brevo 失败：${error instanceof Error ? error.message : String(error)}`
      },
      502
    );
  }
};
