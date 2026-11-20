import type { APIRoute } from 'astro';
import { renderBrandEmail } from '../email-template';

// 仅用于本地预览固定邮件模板，不会进入构建产物。
export const prerender = false;

const env = import.meta.env as unknown as Record<string, string | undefined>;

export const GET: APIRoute = async ({ url }) => {
  const subject = url.searchParams.get('subject')?.trim() || 'jrxh.top · 固定邮件模板';
  const bodyFormat = url.searchParams.get('format') === 'html' ? 'html' : 'text';

  const textBody = `这是一封模板预览。

从本地邮件页发出的每封邮件都会套用这个版式：顶部品牌与主题、正文卡片、底部深色签名区。

纯文本正文会自动转成段落；HTML 正文会原样嵌入模板。

你可以回到 /dev/mail 填写真实内容并发送。`;

  const htmlBody = `<h2>模板预览</h2>
<p>这是一段 <strong>HTML 正文</strong>，会原样嵌入固定模板。</p>
<ul>
  <li>顶部品牌与主题</li>
  <li>正文卡片与排版</li>
  <li>底部深色签名区</li>
</ul>
<p>行内代码：<code>npm run dev</code></p>`;

  const body = url.searchParams.get('body') || (bodyFormat === 'html' ? htmlBody : textBody);

  const rendered = renderBrandEmail({
    subject,
    body,
    bodyFormat,
    senderName: env.BREVO_SENDER_NAME ?? 'Jrxh',
    senderEmail: env.BREVO_SENDER_EMAIL ?? 'hello@jrxh.top'
  });

  return new Response(rendered.html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store'
    }
  });
};
