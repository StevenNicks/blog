const path = require('path');

const BRAND = process.env.APP_NAME || 'Blog';
const ACCENT = '#a6e22e';
const ACCENT_TEXT = '#0e0f0c';
const LOGO_CID = 'blog-logo';

// Logo de la marca (mismo que app/icon.svg del frontend), incrustado como adjunto inline.
const logoAttachment = {
  filename: 'logo.png',
  path: path.join(__dirname, '..', 'assets', 'logo.png'),
  cid: LOGO_CID,
};

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const resetPasswordEmail = ({ name, link, expiresMinutes = 60 }) => {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(link);
  const expires = expiresMinutes >= 60 ? `${Math.round(expiresMinutes / 60)} hora` : `${expiresMinutes} minutos`;

  const subject = `Restablece tu contraseña de ${BRAND}`;

  const text = [
    `Hola ${name},`,
    '',
    `Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${BRAND}.`,
    `Usa este enlace (válido por ${expires}):`,
    link,
    '',
    'Si no lo solicitaste, puedes ignorar este correo: tu contraseña no cambiará.',
    '',
    `— El equipo de ${BRAND}`,
  ].join('\n');

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="color-scheme" content="light">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f5f7;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    Usa este enlace para elegir una nueva contraseña. Vence en ${expires}.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f5f7;padding:32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
          <tr>
            <td style="padding:0 4px 20px 4px;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:18px;font-weight:700;color:#111827;">
              <img src="cid:${LOGO_CID}" width="32" height="32" alt="" style="display:inline-block;vertical-align:middle;border:0;border-radius:8px;">
              <span style="vertical-align:middle;margin-left:8px;">${escapeHtml(BRAND)}</span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#ffffff;border-radius:16px;border:1px solid #e5e7eb;padding:36px 32px;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#374151;">
              <h1 style="margin:0 0 12px 0;font-size:22px;line-height:1.3;color:#111827;">Restablece tu contraseña</h1>
              <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;">Hola ${safeName},</p>
              <p style="margin:0 0 24px 0;font-size:15px;line-height:1.6;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Haz clic en el botón para elegir una nueva.
              </p>
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                <tr>
                  <td align="center" style="border-radius:10px;background-color:${ACCENT};">
                    <a href="${safeLink}" target="_blank" style="display:inline-block;padding:13px 28px;font-size:15px;font-weight:600;color:${ACCENT_TEXT};text-decoration:none;border-radius:10px;">
                      Restablecer contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 20px 0;font-size:13px;line-height:1.6;color:#6b7280;">
                Este enlace es válido por <strong>${expires}</strong> y solo puede usarse una vez.
              </p>
              <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px 0;">
              <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:#6b7280;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
              </p>
              <p style="margin:0 0 20px 0;font-size:12px;line-height:1.6;word-break:break-all;">
                <a href="${safeLink}" target="_blank" style="color:#4d7c0f;">${safeLink}</a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#6b7280;">
                ¿No fuiste tú? Ignora este correo: tu contraseña seguirá siendo la misma.
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding:20px 12px 0 12px;font-family:Segoe UI,Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#9ca3af;">
              Este es un mensaje automático de ${escapeHtml(BRAND)}. Por favor no respondas a este correo.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, text, html, attachments: [logoAttachment] };
};

module.exports = { resetPasswordEmail };
