export type MailBodyFormat = 'text' | 'html';

export interface BrandEmailInput {
  subject: string;
  body: string;
  bodyFormat: MailBodyFormat;
  senderName: string;
  senderEmail: string;
  date?: Date;
}

export interface BrandEmailOutput {
  html: string;
  text: string;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });

const formatStamp = (date: Date) => {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).formatToParts(date);

  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';

  return `${value('year')}-${value('month')}-${value('day')} ${value('hour')}:${value(
    'minute'
  )} CST`;
};

const textToHtml = (body: string) =>
  escapeHtml(body)
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map(
      (paragraph) =>
        `<p style="margin:0 0 14px;">${paragraph.replace(/\n/g, '<br />')}</p>`
    )
    .join('');

const htmlToText = (body: string) =>
  body
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\n{3,}/g, '\n\n')
    .trim();

export const renderBrandEmail = ({
  subject,
  body,
  bodyFormat,
  senderName,
  senderEmail,
  date = new Date()
}: BrandEmailInput): BrandEmailOutput => {
  const safeSubject = escapeHtml(subject);
  const safeName = escapeHtml(senderName);
  const safeEmail = escapeHtml(senderEmail);
  const stamp = formatStamp(date);

  const bodyHtml =
    bodyFormat === 'html'
      ? `<div class="mail-body" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.8;color:#2c3543;word-break:break-word;">${body}</div>`
      : `<div class="mail-body" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.8;color:#2c3543;word-break:break-word;">${textToHtml(
          body
        )}</div>`;

  const textBody = bodyFormat === 'html' ? htmlToText(body) : body.trim();

  const text = [
    subject,
    '',
    textBody,
    '',
    '—',
    `${senderName} <${senderEmail}>`,
    'jrxh.top · spark console',
    stamp,
    '',
    '回复这封邮件可以直接联系 Jrxh。'
  ].join('\n');

  const html = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>${safeSubject}</title>
    <style>
      .mail-body p { margin: 0 0 14px; }
      .mail-body p:last-child { margin-bottom: 0; }
      .mail-body h2 {
        margin: 26px 0 10px;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 20px;
        line-height: 1.4;
        color: #151a22;
      }
      .mail-body h3 {
        margin: 22px 0 8px;
        font-family: Georgia, 'Times New Roman', serif;
        font-size: 17px;
        line-height: 1.45;
        color: #151a22;
      }
      .mail-body a { color: #c2410c; text-decoration: underline; }
      .mail-body ul, .mail-body ol { margin: 0 0 14px; padding-left: 22px; }
      .mail-body li { margin: 0 0 6px; }
      .mail-body code {
        padding: 2px 5px;
        border-radius: 2px;
        background-color: #eae7de;
        color: #0b677a;
        font-family: Menlo, Consolas, 'Courier New', monospace;
        font-size: 13px;
      }
      .mail-body pre {
        margin: 0 0 14px;
        padding: 14px 16px;
        border-radius: 2px;
        background-color: #0e1116;
        color: #e8edf5;
        font-family: Menlo, Consolas, 'Courier New', monospace;
        font-size: 12px;
        line-height: 1.7;
        overflow-x: auto;
      }
      .mail-body pre code { padding: 0; background: transparent; color: inherit; }
      .mail-body blockquote {
        margin: 0 0 14px;
        padding: 2px 0 2px 14px;
        border-left: 2px solid #c2410c;
        color: #4e5766;
      }
      .mail-body img { max-width: 100%; height: auto; }
      @media (max-width: 620px) {
        .mail-pad { padding-left: 20px !important; padding-right: 20px !important; }
        .mail-title { font-size: 22px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:#f4f1ea;-webkit-text-size-adjust:100%;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;mso-hide:all;">
      ${safeSubject} — jrxh.top
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#f4f1ea" style="background-color:#f4f1ea;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="#fbf9f4" style="width:100%;max-width:600px;background-color:#fbf9f4;border:1px solid #e2ded4;border-radius:3px;overflow:hidden;">
            <tr>
              <td height="3" bgcolor="#c2410c" style="height:3px;line-height:3px;font-size:0;">&nbsp;</td>
            </tr>
            <tr>
              <td class="mail-pad" style="padding:26px 32px 0 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="left" style="font-family:Georgia,'Times New Roman',serif;font-size:19px;font-weight:600;color:#151a22;letter-spacing:0.01em;">
                      jrxh<span style="font-family:Menlo,Consolas,'Courier New',monospace;font-size:9px;color:#c2410c;vertical-align:super;">.top</span>
                    </td>
                    <td align="right" style="font-family:Menlo,Consolas,'Courier New',monospace;font-size:9px;letter-spacing:0.14em;text-transform:uppercase;color:#646d7d;">
                      spark console / mail
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td class="mail-pad" style="padding:22px 32px 0 32px;">
                <div style="font-family:Menlo,Consolas,'Courier New',monospace;font-size:10px;letter-spacing:0.1em;color:#c2410c;">
                  jrxh@top:~$ mail
                </div>
                <h1 class="mail-title" style="margin:10px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.35;font-weight:600;letter-spacing:0.01em;color:#151a22;">
                  ${safeSubject}
                </h1>
                <div style="margin-top:12px;font-family:Menlo,Consolas,'Courier New',monospace;font-size:10px;line-height:1.7;color:#646d7d;">
                  ${safeName} &lt;${safeEmail}&gt;<br />
                  ${stamp}
                </div>
              </td>
            </tr>
            <tr>
              <td class="mail-pad" style="padding:20px 32px 0 32px;">
                <div style="height:1px;line-height:1px;font-size:0;background-color:#e2ded4;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td class="mail-pad" style="padding:22px 32px 30px 32px;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td bgcolor="#0e1116" style="background-color:#0e1116;padding:22px 32px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="font-family:Georgia,'Times New Roman',serif;font-size:15px;font-weight:600;color:#f5f7fa;">
                      <span style="color:#ff6a3d;">■</span> jrxh.top
                    </td>
                    <td align="right" style="font-family:Menlo,Consolas,'Courier New',monospace;font-size:9px;letter-spacing:0.12em;text-transform:uppercase;color:#737d92;">
                      sent from jrxh.top
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:10px;font-family:Menlo,Consolas,'Courier New',monospace;font-size:10px;line-height:1.8;color:#8b93a7;">
                      jrxh@top:~$ echo &quot;mail delivered&quot;
                    </td>
                  </tr>
                  <tr>
                    <td colspan="2" style="padding-top:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.7;color:#737d92;">
                      回复这封邮件可以直接联系 Jrxh。
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <div style="max-width:600px;margin:14px auto 0 auto;font-family:Menlo,Consolas,'Courier New',monospace;font-size:9px;letter-spacing:0.08em;color:#6f7787;text-align:center;">
            jrxh.top · spark console
          </div>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  return { html, text };
};
