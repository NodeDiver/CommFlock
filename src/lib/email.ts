import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendPasswordResetEmail(
  email: string,
  resetToken: string,
  username: string,
  locale: 'en' | 'es' = 'en'
) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/${locale}/reset-password?token=${resetToken}`

  const subject = locale === 'es'
    ? 'Restablece tu contraseña de CommFlock'
    : 'Reset your CommFlock password'

  const htmlContent = locale === 'es'
    ? `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hola ${username},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el enlace de abajo para crear una nueva contraseña:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </p>
        <p>O copia y pega este enlace en tu navegador:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          Este enlace expira en 1 hora.<br>
          Si no solicitaste restablecer tu contraseña, ignora este correo.
        </p>
      </div>
    `
    : `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hi ${username},</h2>
        <p>We received a request to reset your password.</p>
        <p>Click the link below to create a new password:</p>
        <p style="margin: 30px 0;">
          <a href="${resetUrl}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Reset Password
          </a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p style="color: #666; font-size: 14px; word-break: break-all;">${resetUrl}</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">
          This link expires in 1 hour.<br>
          If you didn't request a password reset, please ignore this email.
        </p>
      </div>
    `

  if (!resend) {
    console.warn('Email service not configured. Password reset link:')
    console.warn(resetUrl)
    return
  }

  await resend.emails.send({
    from: 'CommFlock <noreply@commflock.com>',
    to: email,
    subject,
    html: htmlContent,
  })
}
