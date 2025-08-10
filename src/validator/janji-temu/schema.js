const Joi = require("joi");
const dayjs = require("dayjs");

const datePattern = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const timeFormat = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

const CreateJanjiTemuPayloadSchema = Joi.object({
  nrp: Joi.string().pattern(/^\d{10,15}$/).required(),
  tipe_konsultasi: Joi.string().valid('online', 'offline').required(),

  preferensi_konselor_id: Joi.string().guid({ version: "uuidv4" }).allow(null).optional(),

  jadwal_utama_tanggal: Joi.string().pattern(datePattern).required(),
  jadwal_utama_jam_mulai: Joi.string().pattern(timeFormat).required(),
  jadwal_utama_jam_selesai: Joi.string().pattern(timeFormat).required(),

  jadwal_alternatif_tanggal: Joi.string().pattern(datePattern).required(),
  jadwal_alternatif_jam_mulai: Joi.string().pattern(timeFormat).required(),
  jadwal_alternatif_jam_selesai: Joi.string().pattern(timeFormat).required(),
})
  .custom((value, helpers) => {
    const { tipe_konsultasi } = value;

    const parseTime = (str) => dayjs(`2025-01-01T${str}`);
    const now = dayjs().startOf('day');
    const maxDate = now.add(30, 'day');

    const tglUtama = dayjs(value.jadwal_utama_tanggal);
    const tglAlternatif = dayjs(value.jadwal_alternatif_tanggal);

    // Validasi tanggal utama
    if (!tglUtama.isAfter(now)) {
      return helpers.message("Tanggal jadwal utama harus setelah hari ini");
    }
    if (tglUtama.isAfter(maxDate)) {
      return helpers.message("Tanggal jadwal utama maksimal 30 hari dari sekarang");
    }

    // Validasi tanggal alternatif
    if (!tglAlternatif.isAfter(now)) {
      return helpers.message("Tanggal jadwal alternatif harus setelah hari ini");
    }
    if (tglAlternatif.isAfter(maxDate)) {
      return helpers.message("Tanggal jadwal alternatif maksimal 30 hari dari sekarang");
    }

    // Validasi jam utama
    const mulaiUtama = parseTime(value.jadwal_utama_jam_mulai);
    const selesaiUtama = parseTime(value.jadwal_utama_jam_selesai);
    const durasiUtama = selesaiUtama.diff(mulaiUtama, 'minute');

    if (durasiUtama <= 0) {
      return helpers.message("Jam selesai harus lebih dari jam mulai pada jadwal utama");
    }

    if (tipe_konsultasi === 'online' && durasiUtama > 30) {
      return helpers.message("Durasi maksimal konsultasi online adalah 30 menit");
    }

    if (tipe_konsultasi === 'offline' && durasiUtama > 60) {
      return helpers.message("Durasi maksimal konsultasi offline adalah 60 menit");
    }

    // Validasi jam alternatif (opsional tapi baik dilakukan juga)
    const mulaiAlternatif = parseTime(value.jadwal_alternatif_jam_mulai);
    const selesaiAlternatif = parseTime(value.jadwal_alternatif_jam_selesai);
    const durasiAlternatif = selesaiAlternatif.diff(mulaiAlternatif, 'minute');

    if (durasiAlternatif <= 0) {
      return helpers.message("Jam selesai harus lebih dari jam mulai pada jadwal alternatif");
    }

    if (tipe_konsultasi === 'online' && durasiAlternatif > 30) {
      return helpers.message("Durasi maksimal konsultasi online (alternatif) adalah 30 menit");
    }

    if (tipe_konsultasi === 'offline' && durasiAlternatif > 60) {
      return helpers.message("Durasi maksimal konsultasi offline (alternatif) adalah 60 menit");
    }

    return value;
  })

const UpdateStatusJanjiTemuPayloadSchema = Joi.object({
  status: Joi.string()
    .valid('menunggu_konfirmasi', 'dikonfirmasi', 'ditolak')
    .required(),

  alasan_penolakan: Joi.string()
    .allow(null, '')
    .when('status', {
      is: 'ditolak',
      then: Joi.string().min(5).required()
        .messages({ 'any.required': 'Alasan penolakan wajib diisi jika status ditolak.' }),
    }),
});

module.exports = {
  CreateJanjiTemuPayloadSchema,
  UpdateStatusJanjiTemuPayloadSchema,
};
