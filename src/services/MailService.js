const nodemailer = require('nodemailer');
const InvariantError = require('../exceptions/InvariantError');

class MailService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(email, token) {
    const message = {
      from: process.env.MAIL_SENDER,
      to: email,
      subject: `${process.env.APP_NAME} - Email Verification`,
      html: `
        <h1>Verify Your Email</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${process.env.BASE_URL}/verify-email?token=${token}">Verify Email</a>
      `,
    };

    await this._transporter.sendMail(message);
  }
  
  async sendResetPasswordEmail(email, token) {
    try {
      const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;
      
      const mailOptions = {
        from: `"${this._appName}" <${this._sender}>`,
        to: email,
        subject: 'Password Reset Request',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Password Reset</h2>
            <p>We received a request to reset your password for ${this._appName}. Click the button below to reset it:</p>
            
            <div style="margin: 20px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">
                Reset Password
              </a>
            </div>
            
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            
            <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
              This link will expire in 1 hour. For security reasons, please don't share this email with anyone.
            </p>
          </div>
        `,
        text: `Reset your password by visiting this link: ${resetUrl}\n\nThis link will expire in 1 hour.`,
      };

      await this._transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new InvariantError('Failed to send password reset email');
    }
  }
}

module.exports = MailService;