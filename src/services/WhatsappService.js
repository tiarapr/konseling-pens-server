const axios = require('axios');

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
          type: "body",
          parameters,
        });
      }

      // Tambah komponen ekstra seperti button
      if (extraComponents.length) {
        components.push(...extraComponents);
      }

      const payload = {
        messaging_product: "whatsapp",
        to: phone,
        type: "template",
        template: {
          name: templateName,
          language: { code: languageCode },
          components
        }
      };

      const response = await axios.post(
        `https://graph.facebook.com/v18.0/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            "Content-Type": "application/json"
          }
        }
      );

      console.log(`✅ Pesan berhasil dikirim ke ${phone}`);
      return { success: true, messageId: response.data.messages[0].id };
    } catch (error) {
      console.error(`❌ Gagal mengirim pesan ke ${phone}:`, error.response?.data || error.message);
      return { success: false, phone, error: error.message };
    }
  }

  async sendOtpMessage(phone, otp) {
    return this.sendTemplateMessage(
      phone,
      "kode_otp_login",
      "id",
      [
        { type: "text", text: otp }  // Body parameter
      ],
      [
        {
          type: "button",
          sub_type: "url",
          index: 0,
          parameters: [
            { type: "text", text: otp }
          ]
        }
      ]
    );
  }

  async sendJanjiTemuNotification(data) {
    const { recipient, appointment } = data;

    return this.sendTemplateMessage(
      recipient.phone,
      "pengajuan_janji_temu_berhasil",
      "id",
      [
        { type: "text", text: recipient.name },                 // {{1}} Nama mahasiswa
        { type: "text", text: appointment.nomor_tiket },        // {{2}} Nomor tiket
        { type: "text", text: appointment.tipe_konsultasi },    // {{3}} Tipe konsultasi
        { type: "text", text: appointment.jadwal_utama },       // {{4}} Jadwal utama
        { type: "text", text: appointment.jadwal_alternatif },  // {{5}} Jadwal alternatif
        { type: "text", text: appointment.status }              // {{6}} Status (misal: Menunggu Konfirmasi)
      ]
    );
  }

  async sendAdminJanjiTemuNotification(data) {
    const { recipient, appointment, mahasiswa } = data;

    return this.sendTemplateMessage(
      recipient.phone,
      "permintaan_janji_temu_baru",
      "id",
      [
        { type: "text", text: appointment.nomor_tiket },         // {{1}}
        { type: "text", text: mahasiswa.nama },                  // {{2}}
        { type: "text", text: appointment.tipe_konsultasi },     // {{3}}
        { type: "text", text: appointment.jadwal_utama },        // {{4}}
        { type: "text", text: appointment.jadwal_alternatif },   // {{5}}
        { type: "text", text: appointment.status },              // {{6}}
      ]
    );
  }

  async statusJanjiTemuUpdateNotification(data) {
    const { recipient, appointment } = data;

    return this.sendTemplateMessage(
      recipient.phone,
      "pembaruan_status_janji_temu", // nama template kamu di Meta
      "id", // kode bahasa, sesuai template
      [
        { type: "text", text: recipient.name || "-" },
        { type: "text", text: appointment.nomorTiket || "-" },
        { type: "text", text: appointment.tipeKonsultasi || "-" },
        { type: "text", text: appointment.jadwalUtama || "-" },
        { type: "text", text: appointment.jadwalAlternatif || "-" },
        { type: "text", text: appointment.status || "-" }
      ]
    );
  }

  async sendJadwalKonselingNotification(data) {
    const { recipient, konseling } = data;

    return this.sendTemplateMessage(
      recipient.phone,
      "jadwal_konseling",
      "id",
      [
        { type: "text", text: recipient.name },       // {{1}} Nama mahasiswa
        { type: "text", text: konseling.konselor },   // {{2}} Nama konselor
        { type: "text", text: konseling.tanggal },    // {{3}} Tanggal
        { type: "text", text: konseling.waktu },      // {{4}} Waktu
        { type: "text", text: konseling.lokasi },     // {{5}} Lokasi
      ]
    );
  }

  async sendKonfirmasiKehadiranNotification(data) {
    const { recipient, konseling, hadir } = data;

    const templateName = hadir
      ? "konfirmasi_kehadiran_hadir"
      : "konfirmasi_kehadiran_tidak_hadir";

    return this.sendTemplateMessage(
      recipient.phone,
      templateName,
      "id",
      [
        { type: "text", text: recipient.name },       // {{1}}
        { type: "text", text: konseling.tanggal },    // {{2}}
        { type: "text", text: konseling.waktu },      // {{3}}
        { type: "text", text: konseling.lokasi },     // {{4}}
      ]
    );
  }

}

module.exports = WhatsAppService;
