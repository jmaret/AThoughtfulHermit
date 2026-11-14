const SITE_URL = Deno.env.get('SITE_URL') ?? 'https://jmaret.github.io/AThoughtfulHermit';
const BG_URL = `${SITE_URL}/images/AThoughtFulHermit.jpg`;
const LOGO_URL = `${SITE_URL}/images/TransparentMasterLogo.png`;
const FROM_EMAIL = Deno.env.get('RESEND_FROM') ?? 'AThoughtfulHermit <onboarding@resend.dev>';

export function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function wrapCabinEmail(innerCardHtml: string, options?: { preheader?: string }): string {
  const preheader = escapeHtml(options?.preheader ?? '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>AThoughtfulHermit</title>
</head>
<body style="margin:0;padding:0;background-color:#1c1612;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#1c1612;">
    <tr>
      <td align="center" background="${BG_URL}" bgcolor="#1c1612" style="background-color:#1c1612;background-image:url('${BG_URL}');background-size:cover;background-position:center;padding:28px 16px;">
        <!--[if gte mso 9]>
        <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style="width:640px;">
          <v:fill type="frame" src="${BG_URL}" color="#1c1612" />
          <v:textbox style="mso-fit-shape-to-text:true" inset="0,0,0,0">
        <![endif]-->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;margin:0 auto;">
          <tr>
            <td align="center" style="padding-bottom:16px;">
              <img src="${LOGO_URL}" width="72" height="72" alt="AThoughtfulHermit" style="display:block;border:0;border-radius:50%;" />
            </td>
          </tr>
          <tr>
            <td style="background-color:#fcf6ec;border-radius:16px;padding:28px 24px;color:#1c1612;font-family:Georgia,'Times New Roman',serif;">
              ${innerCardHtml}
            </td>
          </tr>
        </table>
        <!--[if gte mso 9]>
          </v:textbox>
        </v:rect>
        <![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function articleEmailHtml(piece: {
  title: string;
  series: string;
  excerpts: string[];
  unsubscribeUrl?: string;
}): string {
  const excerpts = piece.excerpts
    .map(
      (text) =>
        `<p style="margin:0 0 12px;font-size:16px;line-height:1.6;color:#3a2f28;">${escapeHtml(text)}</p>`
    )
    .join('');
  const unsub = piece.unsubscribeUrl
    ? `<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:#6b4a2e;"><a href="${escapeHtml(piece.unsubscribeUrl)}" style="color:#6b4a2e;">Unsubscribe</a></p>`
    : '';

  const card = `
    <p style="margin:0 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#6b4a2e;font-weight:bold;">${escapeHtml(piece.series)}</p>
    <h1 style="margin:0 0 14px;font-size:26px;line-height:1.25;color:#1c1612;">${escapeHtml(piece.title)}</h1>
    ${excerpts}
    <p style="margin:20px 0 0;">
      <a href="${SITE_URL}/" style="display:inline-block;background:#3d2a1a;color:#fcf6ec;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;">Read on the site</a>
    </p>
    ${unsub}
    <p style="margin:14px 0 0;font-size:12px;color:#6b4a2e;">AThoughtfulHermit · reflective notes for the long walk home</p>
  `;

  return wrapCabinEmail(card, { preheader: `${piece.series}: ${piece.title}` });
}

export function simpleNoticeEmailHtml(title: string, body: string, ctaHref?: string, ctaLabel?: string): string {
  const cta =
    ctaHref && ctaLabel
      ? `<p style="margin:20px 0 0;"><a href="${escapeHtml(ctaHref)}" style="display:inline-block;background:#3d2a1a;color:#fcf6ec;text-decoration:none;padding:10px 18px;border-radius:999px;font-size:14px;">${escapeHtml(ctaLabel)}</a></p>`
      : '';
  const card = `
    <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#1c1612;">${escapeHtml(title)}</h1>
    <p style="margin:0;font-size:16px;line-height:1.6;color:#3a2f28;">${escapeHtml(body)}</p>
    ${cta}
  `;
  return wrapCabinEmail(card, { preheader: title });
}

export async function sendResendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
}): Promise<{ id?: string; error?: string }> {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!apiKey) {
    return { error: 'Missing RESEND_API_KEY' };
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return { error: payload?.message || `Resend error ${response.status}` };
  }
  return { id: payload?.id };
}

export function siteUrl(): string {
  return SITE_URL;
}

export function functionsBaseUrl(): string {
  const url = Deno.env.get('SUPABASE_URL');
  if (!url) {
    throw new Error('Missing SUPABASE_URL');
  }
  return `${url}/functions/v1`;
}
