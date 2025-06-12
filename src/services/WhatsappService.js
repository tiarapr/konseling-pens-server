const axios = require('axios');
const WhatsappQueue = require('../queues/WhatsappQueue');

class WhatsAppService {
  constructor() {
    this.phoneNumberId = process.env.WA_PHONE_NUMBER_ID;
    this.accessToken = process.env.WA_ACCESS_TOKEN;

    if (!this.phoneNumberId || !this.accessToken) {
      throw new Error('WA_PHONE_NUMBER_ID dan WA_ACCESS_TOKEN harus disetel di environment');
    }
  }

  async sendTemplateMessage(phone, templateName, languageCode, parameters = [], extraComponents = []) {
    try {
      const components = [];

      if (parameters.length) {
        components.push({
          type: 'body',
          parameters,
        });
      }

      if (extraComponents.length) {
        components.push(...extraComponents);
      }

      const payload = {
        messaging_product: 'whatsapp',
        to: phone,
        type: 'template',
        template: {
          name: templateName,
          language: { code: languageCode },
          components,
        },
      };

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`✅ Pesan berhasil dikirim ke ${phone}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error(`❌ Gagal mengirim pesan ke ${phone}:`, error.response?.data || error.message);
      return { success: false, phone, error: error.message };
    }
  }

  async enqueueTemplateMessage(phone, templateName, languageCode, parameters = [], extraComponents = []) {
    return WhatsappQueue.add('sendTemplateMessage', {
      type: 'sendTemplateMessage',
      data: { phone, templateName, languageCode, parameters, extraComponents },
    });
  }

  async sendOtpMessage(phone, otp) {
    return this.enqueueTemplateMessage(
      phone,
      'kode_otp_login',
      'id',
      [{ type: 'text', text: otp }]
    );
  }

  async sendJanjiTemuNotification(data) {
    const { recipient, appointment } = data;

    return this.enqueueTemplateMessage(
      recipient.phone,
      'pengajuan_janji_temu_berhasil',
      'id',
      [
        { type: 'text', text: recipient.name },
        { type: 'text', text: appointment.nomor_tiket },
        { type: 'text', text: appointment.tipe_konsultasi },
        { type: 'text', text: appointment.jadwal_utama },
        { type: 'text', text: appointment.jadwal_alternatif },
        { type: 'text', text: appointment.status },
      ]
    );
  }

  async sendAdminJanjiTemuNotification(data) {
    const { recipient, appointment, mahasiswa } = data;

    return this.enqueueTemplateMessage(
      recipient.phone,
      'permintaan_janji_temu_baru',
      'id',
      [
        { type: 'text', text: appointment.nomor_tiket },
        { type: 'text', text: mahasiswa.nama },
        { type: 'text', text: appointment.tipe_konsultasi },
        { type: 'text', text: appointment.jadwal_utama },
        { type: 'text', text: appointment.jadwal_alternatif },
        { type: 'text', text: appointment.status },
      ]
    );
  }

  async statusJanjiTemuUpdateNotification(data) {
    const { recipient, appointment } = data;

    return this.enqueueTemplateMessage(
      recipient.phone,
      'pembaruan_status_janji_temu',
      'id',
      [
        { type: 'text', text: recipient.name || '-' },
        { type: 'text', text: appointment.nomorTiket || '-' },
        { type: 'text', text: appointment.tipeKonsultasi || '-' },
        { type: 'text', text: appointment.jadwalUtama || '-' },
        { type: 'text', text: appointment.jadwalAlternatif || '-' },
        { type: 'text', text: appointment.status || '-' },
      ]
    );
  }

  async sendJadwalKonselingNotification(data) {
    const { recipient, konseling } = data;

    return this.enqueueTemplateMessage(
      recipient.phone,
      'jadwal_konseling',
      'id',
      [
        { type: 'text', text: recipient.name },
        { type: 'text', text: konseling.konselor },
        { type: 'text', text: konseling.tanggal },
        { type: 'text', text: konseling.waktu },
        { type: 'text', text: konseling.lokasi },
      ]
    );
  }

  async sendKonfirmasiKehadiranNotification(data) {
    const { recipient, konseling, hadir } = data;

    const templateName = hadir
      ? 'konfirmasi_kehadiran_hadir'
      : 'konfirmasi_kehadiran_tidak_hadir';

    return this.enqueueTemplateMessage(
      recipient.phone,
      templateName,
      'id',
      [
        { type: 'text', text: recipient.name },
        { type: 'text', text: konseling.tanggal },
        { type: 'text', text: konseling.waktu },
        { type: 'text', text: konseling.lokasi },
      ]
    );
  }
}

module.exports = WhatsAppService;
