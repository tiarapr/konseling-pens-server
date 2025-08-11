const baseTemplate = require('../BaseTemplate');

const untukMahasiswa = (appName, namaMahasiswa, data) => {
    const content = `
    <h3 style="margin-top: 0;">Perubahan Jadwal Konseling</h3>
    <p>Halo <strong>${namaMahasiswa}</strong>,</p>
    <p>Terdapat pembaruan pada jadwal konseling Anda. Berikut detail jadwal konseling terbaru:</p>
    
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
  `;

    return baseTemplate(content, appName, {
        title: `Pembaruan Jadwal Konseling - ${appName}`,
    });
};

const untukKonselor = (appName, namaKonselor, data) => {
    const content = `
    <h3 style="margin-top: 0;">Perubahan Jadwal Konseling Anda</h3>
    <p>Halo <strong>${namaKonselor}</strong>,</p>
    <p>Terdapat pembaruan pada jadwal konseling Anda. Berikut detail jadwal konseling terbaru:</p>
    
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
  `;

    return baseTemplate(content, appName, {
        title: `Pembaruan Jadwal Konseling - ${appName}`,
    });
};

module.exports = {
    untukMahasiswa,
    untukKonselor,
};