const nodemailer = require('nodemailer');
const InvariantError = require('../exceptions/InvariantError');
const verificationEmail = require('../email-templates/email-verification/EmailVerificationTemplate');
const otpEmailTemplate = require('../email-templates/otp/OTPEmailTemplate'); 
const resetPasswordEmail = require('../email-templates/reset-password/ResetPasswordTemplate');
const janjiTemuCreatedEmailTemplate = require('../email-templates/janji-temu/JanjiTemuCreatedEmailTemplate');
const janjiTemuUpdatedEmailTemplate = require('../email-templates/janji-temu/JanjiTemuUpdatedEmailTemplate');
const BaseTemplate = require('../email-templates/BaseTemplate');

class MailService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
      }
    });

    this._sender = `"${process.env.APP_NAME}" <${process.env.MAIL_SENDER}>`;
    this._appName = process.env.APP_NAME;
    this._baseUrl = process.env.BASE_URL;
  }

  async _sendMail({ to, subject, html }) {
    try {
      const mailOptions = {
        from: this._sender,
        to,
        subject,
        html,
        text: html.replace(/<[^>]+>/g, '')
      };

      const info = await this._transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('MailService Error:', error);
      throw new InvariantError('Failed to send email');
    }
  }

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${this._baseUrl}/verify-email?token=${token}`;
    const html = verificationEmail(this._appName, verificationUrl);

    return this._sendMail({
      to: email,
      subject: `[${this._appName}] Verifikasi Email`,
      html
    });
  }

  async sendOtpEmail(email, otpCode) {
    const html = otpEmailTemplate(this._appName, otpCode);
    return this._sendMail({
      to: email,
      subject: `[${this._appName}] Kode OTP Anda`,
      html
    });
  }

  async sendResetPasswordEmail(email, token, userName) {
    const resetUrl = `${this._baseUrl}/reset-password?token=${token}`;
    const html = resetPasswordEmail(this._appName, resetUrl, userName);

    return this._sendMail({
      to: email,
      subject: `[${this._appName}] Permintaan Reset Password`,
      html
    });
  }

  async sendJanjiTemuNotification(email, mahasiswa, janjiTemuData) {
    const html = janjiTemuCreatedEmailTemplate.untukMahasiswa(
      this._appName,
      mahasiswa.nama,
      {
        nomor_tiket: janjiTemuData.nomor_tiket,
        tipe_konsultasi: janjiTemuData.tipe_konsultasi,
        jadwal_utama: janjiTemuData.jadwal_utama,
        jadwal_alternatif: janjiTemuData.jadwal_alternatif
      }
    );

    return this._sendMail({
      to: email,
      subject: `[${this._appName}] Janji Temu Berhasil Diajukan`,
      html
    });
  }

  async sendJanjiTemuAdminNotification(email, mahasiswa, janjiTemuData) {
    const html = janjiTemuCreatedEmailTemplate.untukAdmin(
      this._appName,
      mahasiswa.nama,
      {
        nomor_tiket: janjiTemuData.nomor_tiket,
        tipe_konsultasi: janjiTemuData.tipe_konsultasi,
        jadwal_utama: janjiTemuData.jadwal_utama,
        jadwal_alternatif: janjiTemuData.jadwal_alternatif
      }
    );

    return this._sendMail({
      to: email,
      subject: `[${this._appName}] Permintaan Janji Temu Baru`,
      html
    });
  }

  async sendJanjiTemuUpdateNotification(email, mahasiswa, janjiTemuData) {
    const html = janjiTemuUpdatedEmailTemplate(
      this._appName,
      mahasiswa.nama,
      {
        nomor_tiket: janjiTemuData.nomorTiket,
        tipe_konsultasi: janjiTemuData.tipeKonsultasi,
        jadwal_utama: janjiTemuData.jadwalUtama,
        jadwal_alternatif: janjiTemuData.jadwalAlternatif,
        status: janjiTemuData.status
      }
    );

    return this._sendMail({
      to: email,
      subject: `[${this._appName}] Status Janji Temu Diperbarui`,
      html
    });
  }

  async sendEmail(to, subject, content) {
    const html = BaseTemplate(content, this._appName);
    return this._sendMail({ to, subject, html });
  }

  async verifyConnection() {
    try {
      await this._transporter.verify();
      console.log('SMTP connection verified');
      return true;
    } catch (error) {
      console.error('SMTP connection failed:', error);
      return false;
    }
  }
}

module.exports = MailService;