import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'noreply@quantumfit.com';
}

export async function sendResetPasswordEmail(
  to: string,
  resetToken: string
): Promise<void> {
  const transporter = getTransporter();
  const from = getFromAddress();

  const resetLink = `quantumfit://reset-password?token=${resetToken}`;

  if (!transporter) {
    console.log('─────────────────────────────────────────────');
    console.log(`🔐 RESETEO DE CONTRASEÑA para: ${to}`);
    console.log(`   Token: ${resetToken}`);
    console.log(`   Link: ${resetLink}`);
    console.log('   ⚠️  SMTP no configurado. El token solo se muestra en consola.');
    console.log('   Configurá SMTP_HOST, SMTP_USER y SMTP_PASS en .env');
    console.log('─────────────────────────────────────────────');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"QuantumFit" <${from}>`,
      to,
      subject: 'Restablece tu contraseña - QUANTUM FIT',
      text: `Recibiste este email porque solicitaste restablecer tu contraseña.\n\nTu código de restablecimiento es: ${resetToken}\n\nSi no solicitaste esto, ignorá este mensaje.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #0A0A0A; color: #E0E0E0; border-radius: 12px; overflow: hidden;">
          <div style="padding: 32px 24px; text-align: center; border-bottom: 2px solid #00F0FF;">
            <h1 style="color: #00F0FF; font-size: 28px; margin: 0;">QUANTUM <span style="color: #39FF14;">FIT</span></h1>
          </div>
          <div style="padding: 32px 24px;">
            <h2 style="color: #FFFFFF; margin-bottom: 16px;">Restablecer contraseña</h2>
            <p style="color: #B0B0B0; line-height: 1.6; margin-bottom: 24px;">
              Recibiste este email porque solicitaste restablecer tu contraseña.
            </p>
            <div style="text-align: center; margin-bottom: 24px;">
              <div style="background: #1A1A1A; border: 1px solid #00F0FF; border-radius: 8px; padding: 16px; display: inline-block; font-family: monospace; font-size: 18px; color: #00F0FF; letter-spacing: 4px; user-select: all;">
                ${resetToken}
              </div>
            </div>
            <p style="color: #B0B0B0; font-size: 13px; text-align: center; margin-bottom: 0;">
              Si no solicitaste restablecer tu contraseña, ignorá este mensaje.
            </p>
          </div>
          <div style="padding: 16px 24px; text-align: center; border-top: 1px solid #1A1A1A;">
            <p style="color: #666; font-size: 12px; margin: 0;">QUANTUM FIT — Tu mejor versión comienza aquí</p>
          </div>
        </div>
      `,
    });

    console.log(`📧 Email enviado a ${to} con token de reseteo`);
  } catch (error) {
    console.error(`Error al enviar email a ${to}:`, error);
  }
}
