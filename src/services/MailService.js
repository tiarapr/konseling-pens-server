const nodemailer = require('nodemailer');
const InvariantError = require('../exceptions/InvariantError');
const verificationEmail = require('../email-templates/email-verification/EmailVerificationTemplate');
const otpEmailTemplate = require('../email-templates/otp/OTPEmailTemplate');
const resetPasswordEmail = require('../email-templates/reset-password/ResetPasswordTemplate');
const janjiTemuCreatedEmailTemplate = require('../email-templates/janji-temu/JanjiTemuCreatedEmailTemplate');
const janjiTemuUpdatedEmailTemplate = require('../email-templates/janji-temu/JanjiTemuUpdatedEmailTemplate');
const KonselingCreatedEmailTemplate = require('../email-templates/konseling/KonselingCreatedEmailTemplate');
const KonselingRescheduleEmailTemplate = require('../email-templates/konseling/KonselingRescheduleEmailTemplate');
const KonselingConfirmedEmailTemplate = require('../email-templates/konseling/KonselingConfirmedEmailTemplate');
const KonselingCancelledEmailTemplate = require('../email-templates/konseling/KonselingCancelledEmailTemplate');
const KonselingCompletedEmailTemplate = require('../email-templates/konseling/KonselingCompletedEmailTemplate');
const BaseTemplate = require('../email-templates/BaseTemplate');
const MailQueue = require('../queues/MailQueue');

class MailService {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: parseInt(process.env.MAIL_PORT, 10),
      secure: process.env.MAIL_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production',
      },
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
        text: html.replace(/<[^>]+>/g, ''),
      };

      const info = await this._transporter.sendMail(mailOptions);
      console.log(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      console.error('MailService Error:', error);
      throw new InvariantError('Failed to send email');
    }
  }

  // Job enqueue functions

  async sendVerificationEmail(email, token) {
    const verificationUrl = `${this._baseUrl}/verify-email?token=${token}`;
    const html = verificationEmail(this._appName, verificationUrl);

    await MailQueue.add('sendVerificationEmail', {
      to: email,
      subject: `[${this._appName}] Verifikasi Email`,
      html,
    });
  }

  async sendOtpEmail(email, otpCode) {
    const html = otpEmailTemplate(this._appName, otpCode);

    await MailQueue.add('sendOtpEmail', {
      to: email,
      subject: `[${this._appName}] Kode OTP Anda`,
      html,
    });
  }

  async sendResetPasswordEmail(email, token, userName) {
    const resetUrl = `${this._baseUrl}/reset-password?token=${token}`;
    const html = resetPasswordEmail(this._appName, resetUrl, userName);

    await MailQueue.add('sendResetPasswordEmail', {
      to: email,
      subject: `[${this._appName}] Permintaan Reset Password`,
      html,
    });
  }

  async sendJanjiTemuNotification(email, mahasiswa, janjiTemuData) {
    const html = janjiTemuCreatedEmailTemplate.untukMahasiswa(this._appName, mahasiswa.nama, {
      nomor_tiket: janjiTemuData.nomor_tiket,
      tipe_konsultasi: janjiTemuData.tipe_konsultasi,
      jadwal_utama: janjiTemuData.jadwal_utama,
      jadwal_alternatif: janjiTemuData.jadwal_alternatif,
    });

    await MailQueue.add('sendJanjiTemuNotification', {
      to: email,
      subject: `[${this._appName}] Janji Temu Berhasil Diajukan`,
      html,
    });
  }

  async sendJanjiTemuAdminNotification(email, mahasiswa, janjiTemuData) {
    const html = janjiTemuCreatedEmailTemplate.untukAdmin(this._appName, mahasiswa.nama, {
      nomor_tiket: janjiTemuData.nomor_tiket,
      tipe_konsultasi: janjiTemuData.tipe_konsultasi,
      jadwal_utama: janjiTemuData.jadwal_utama,
      jadwal_alternatif: janjiTemuData.jadwal_alternatif,
    });

    await MailQueue.add('sendJanjiTemuAdminNotification', {
      to: email,
      subject: `[${this._appName}] Permintaan Janji Temu Baru`,
      html,
    });
  }

  async sendJanjiTemuUpdateNotification(email, mahasiswa, janjiTemuData) {
    const html = janjiTemuUpdatedEmailTemplate(this._appName, mahasiswa.nama, {
      nomor_tiket: janjiTemuData.nomorTiket,
      tipe_konsultasi: janjiTemuData.tipeKonsultasi,
      jadwal_utama: janjiTemuData.jadwalUtama,
      jadwal_alternatif: janjiTemuData.jadwalAlternatif,
      status: janjiTemuData.status,
    });

    await MailQueue.add('sendJanjiTemuUpdateNotification', {
      to: email,
      subject: `[${this._appName}] Status Janji Temu Diperbarui`,
      html,
    });
  }

  async sendJadwalKonselingMahasiswaNotification(email, recipientName, konselingData) {
    const html = KonselingCreatedEmailTemplate.untukMahasiswa(this._appName, recipientName.nama, {
      konselor: konselingData.konselor,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
    });

    await MailQueue.add('sendJadwalKonselingNotification', {
      to: email,
      subject: `[${this._appName}] Informasi Jadwal Konseling`,
      html,
    });
  }

  async sendJadwalKonselingKonselorNotification(email, recipientName, konselingData) {
    const html = KonselingCreatedEmailTemplate.untukKonselor(this._appName, recipientName.nama, {
      mahasiswa: konselingData.mahasiswa,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status: konselingData.statusKonseling,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendJadwalKonselingNotification', {
      to: email,
      subject: `[${this._appName}] Jadwal Konseling Baru`,
      html,
    });
  }

  async sendPembaruanJadwalKonselingMahasiswaNotification(email, recipientName, konselingData) {
    const html = KonselingRescheduleEmailTemplate.untukMahasiswa(this._appName, recipientName.nama, {
      konselor: konselingData.konselor,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
    });

    await MailQueue.add('sendJadwalKonselingNotification', {
      to: email,
      subject: `[${this._appName}] Informasi Perubahan Jadwal Konseling`,
      html,
    });
  }

  async sendPembaruanJadwalKonselingKonselorNotification(email, recipientName, konselingData) {
    const html = KonselingRescheduleEmailTemplate.untukKonselor(this._appName, recipientName.nama, {
      mahasiswa: konselingData.mahasiswa,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status: konselingData.statusKonseling,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendJadwalKonselingNotification', {
      to: email,
      subject: `[${this._appName}] Informasi Perubahan Jadwal Konseling`,
      html,
    });
  }

  async sendKonfirmasiKehadiranMahasiswa(email, mahasiswa, konselingData) {
    const html = KonselingConfirmedEmailTemplate.untukMahasiswaJikaHadir(this._appName, mahasiswa.nama, {
      konselor: konselingData.konselor,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendKonfirmasiKehadiranMahasiswa', {
      to: email,
      subject: `[${this._appName}] Konfirmasi Kehadiran Konseling`,
      html,
    });
  }

  async sendKetidakhadiranMahasiswa(email, mahasiswa, konselingData) {
    const html = KonselingConfirmedEmailTemplate.untukMahasiswaJikaTidakHadir(this._appName, mahasiswa.nama, {
      konselor: konselingData.konselor,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status: konselingData.statusKonseling,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendKetidakhadiranMahasiswa', {
      to: email,
      subject: `[${this._appName}] Konfirmasi Ketidakhadiran Konseling`,
      html,
    });
  }

  async sendKonfirmasiKehadiranAdmin(email, konselingData) {
    const html = KonselingConfirmedEmailTemplate.untukAdminJikaMahasiswaHadir(this._appName, null, {
      mahasiswa: konselingData.mahasiswa,
      konselor: konselingData.konselor,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendKonfirmasiKehadiranAdmin', {
      to: email,
      subject: `[${this._appName}] Konfirmasi Kehadiran Mahasiswa`,
      html,
    });
  }

  async sendKetidakhadiranAdmin(email, konselingData) {
    const html = KonselingConfirmedEmailTemplate.untukAdminJikaMahasiswaTidakHadir(this._appName, null, {
      mahasiswa: konselingData.mahasiswa,
      konselor: konselingData.konselor,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status: konselingData.statusKonseling,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendKetidakhadiranAdmin', {
      to: email,
      subject: `[${this._appName}] Ketidakhadiran Mahasiswa`,
      html,
    });
  }

  async sendKonfirmasiKehadiranKonselor(email, konselor, konselingData) {
    const html = KonselingConfirmedEmailTemplate.untukKonselorJikaMahasiswaHadir(this._appName, konselor.nama, {
      mahasiswa: konselingData.mahasiswa,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendKonfirmasiKehadiranKonselor', {
      to: email,
      subject: `[${this._appName}] Mahasiswa Terkonfirmasi Hadir`,
      html,
    });
  }

  async sendKetidakhadiranKonselor(email, konselor, konselingData) {
    const html = KonselingConfirmedEmailTemplate.untukKonselorJikaMahasiswaTidakHadir(this._appName, konselor.nama, {
      mahasiswa: konselingData.mahasiswa,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status: konselingData.statusKonseling,
      status_kehadiran: konselingData.statusKehadiran,
    });

    await MailQueue.add('sendKetidakhadiranKonselor', {
      to: email,
      subject: `[${this._appName}] Mahasiswa Tidak Hadir`,
      html,
    });
  }

  async sendPembatalanMahasiswa(email, mahasiswa, konselingData) {
    const html = KonselingCancelledEmailTemplate.untukMahasiswa(this._appName, mahasiswa.nama, {
      konselor: konselingData.konselor,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status: konselingData.statusKonseling,
    });

    await MailQueue.add('sendPembatalanMahasiswa', {
      to: email,
      subject: `[${this._appName}] Pembatalan Sesi Konseling`,
      html,
    });
  }

  async sendPembatalanKonselor(email, konselor, konselingData) {
    const html = KonselingCancelledEmailTemplate.untukKonselor(this._appName, konselor.nama, {
      mahasiswa: konselingData.mahasiswa,
      tanggal: konselingData.tanggal,
      waktu: konselingData.waktu,
      lokasi: konselingData.lokasi,
      status: konselingData.statusKonseling,
    });

    await MailQueue.add('sendPembatalanMahasiswa', {
      to: email,
      subject: `[${this._appName}] Pembatalan Sesi Konseling`,
      html,
    });
  }

  async sendKonselingSelesai(email, mahasiswa, konselingData) {
    const html = KonselingCompletedEmailTemplate.untukMahasiswa(this._appName, mahasiswa.nama, {
      konselor: konselingData.konselor
    });

    await MailQueue.add('sendKonselingSelesai', {
      to: email,
      subject: `[${this._appName}] Sesi Konseling Selesai`,
      html,
    });
  }

  async sendEmail(to, subject, content) {
    const html = BaseTemplate(content, this._appName);
    await MailQueue.add('sendEmail', { to, subject, html });
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