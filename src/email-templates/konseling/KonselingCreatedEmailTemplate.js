const baseTemplate = require('../BaseTemplate');

const untukMahasiswa = (appName, namaMahasiswa, data) => {
  const content = `
    <h3 style="margin-top: 0;">Jadwal Konseling Anda</h3>
    <p>Halo <strong>${namaMahasiswa}</strong>,</p>
    <p>Berikut adalah detail jadwal konseling Anda:</p>
    
    <div class="detail">
      <p><strong>Konselor:</strong><br>${data.konselor}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status ? `<p><strong>Status Konseling:</strong><br>${data.status}</p>` : ''}
      ${data.status_kehadiran ? `<p><strong>Status Kehadiran:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>
    
    <p>Mohon untuk memberikan konfirmasi kehadiran di dashboard sistem maksimal 2 hari sebelum tanggal pelaksanaan.</p>
    <p>Jika tidak ada konfirmasi, sesi konseling tidak dapat dilayani.</p>
    <p>Terima kasih,</p>
    <p>Tim ${appName}</p>
  `;

  return baseTemplate(content, appName, {
    title: `Jadwal Konseling - ${appName}`,
  });
};

const untukKonselor = (appName, namaKonselor, data) => {
  const content = `
    <h3 style="margin-top: 0;">Jadwal Konseling Anda</h3>
    <p>Halo <strong>${namaKonselor}</strong>,</p>
    <p>Anda memiliki sesi konseling yang dijadwalkan dengan detail sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Mahasiswa:</strong><br>${data.mahasiswa}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status ? `<p><strong>Status Konseling:</strong><br>${data.status}</p>` : ''}
      ${data.status_kehadiran ? `<p><strong>Status Kehadiran Mahasiswa:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>

    <p>Harap pantau email Anda untuk informasi lebih lanjut terkait konfirmasi kehadiran mahasiswa.</p>
    <p>Jika ada perubahan atau pertanyaan, silakan cek dashboard sistem.</p>
    <p>Terima kasih atas dedikasi Anda,</p>
    <p>Tim ${appName}</p>
  `;

  return baseTemplate(content, appName, {
    title: `Jadwal Konseling - ${appName}`,
  });
};

module.exports = {
  untukMahasiswa,
  untukKonselor,
};