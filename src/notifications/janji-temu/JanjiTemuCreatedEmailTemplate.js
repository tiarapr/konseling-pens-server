const baseTemplate = require('../BaseTemplate');

const untukMahasiswa = (appName, namaMahasiswa, data) => {
  const content = `
    <h3 style="margin-top: 0;">Janji Temu Berhasil Diajukan</h3>
    <p>Halo ${namaMahasiswa},</p>
    <p>Pengajuan janji temu Anda telah berhasil kami terima dengan detail sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Nomor Tiket:</strong><br>${data.nomor_tiket}</p>
      <p><strong>Jenis Konsultasi:</strong><br>${data.tipe_konsultasi}</p>
      <p><strong>Jadwal Utama:</strong><br>${data.jadwal_utama}</p>
      <p><strong>Jadwal Alternatif:</strong><br>${data.jadwal_alternatif}</p>
      <p><strong>Status:</strong> Menunggu Konfirmasi</p>
    </div>
    
    <p>Kami akan segera memproses permintaan Anda dan menginformasikan jadwal yang dikonfirmasi.</p>
    <p>Harap pantau email Anda untuk informasi lebih lanjut.</p>
  `;

  return baseTemplate(content, appName, {
    title: `Janji Temu - ${appName}`,
  });
};

const untukAdmin = (appName, namaMahasiswa, data) => {
  const content = `
    <h3 style="margin-top: 0;">Permintaan Janji Temu Baru</h3>
    <p>Halo Admin,</p>
    <p>Telah diterima permintaan janji temu baru dari mahasiswa dengan detail sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Nama Mahasiswa:</strong><br>${namaMahasiswa}</p>
      <p><strong>Nomor Tiket:</strong><br>${data.nomor_tiket}</p>
      <p><strong>Jenis Konsultasi:</strong><br>${data.tipe_konsultasi}</p>
      <p><strong>Jadwal Utama:</strong><br>${data.jadwal_utama}</p>
      <p><strong>Jadwal Alternatif:</strong><br>${data.jadwal_alternatif}</p>
      <p><strong>Status Saat Ini:</strong> Menunggu Konfirmasi</p>
    </div>

    <p>Silakan segera melakukan pengecekan dan konfirmasi jadwal sesuai ketersediaan.</p>
    <p>Terima kasih atas perhatian dan kerjasamanya.</p>
  `;

  return baseTemplate(content, appName, {
    title: `Permintaan Janji Temu Baru - ${appName}`,
  });
};

module.exports = {
  untukMahasiswa,
  untukAdmin,
};
