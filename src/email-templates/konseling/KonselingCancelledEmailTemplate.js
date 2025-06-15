const baseTemplate = require('../BaseTemplate');

const untukMahasiswa = (appName, namaMahasiswa, data) => {
    const content = `
    <h3 style="margin-top: 0;">Pemberitahuan Pembatalan Sesi Konseling</h3>
    <p>Halo <strong>${namaMahasiswa}</strong>,</p>
    <p>Kami ingin memberitahukan adanya pembaruan terkait sesi konseling Anda dengan informasi sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Konselor:</strong><br>${data.konselor}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status ? `<p><strong>Status Konseling:</strong><br>${data.status}</p>` : ''}
    </div>
    
    <p>Bahwa sesi konseling ini telah dibatalkan. Silakan kunjungi dashboard sistem Anda untuk informasi lebih lanjut.</p>
    <p>Terima kasih,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Pembatalan Sesi Konseling - ${appName}`,
    });
};

const untukKonselor = (appName, namaKonselor, data) => {
    const content = `
    <h3 style="margin-top: 0;">Pemberitahuan Pembatalan Sesi Konseling</h3>
    <p>Halo <strong>${namaKonselor}</strong>,</p>
    <p>Kami ingin memberitahukan adanya pembaruan terkait sesi konseling Anda dengan informasi sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Mahasiswa:</strong><br>${data.mahasiswa}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status ? `<p><strong>Status Konseling:</strong><br>${data.status}</p>` : ''}
    </div>

    <p>Bahwa sesi konseling ini telah dibatalkan. Silakan kunjungi dashboard sistem Anda untuk informasi lebih lanjut.</p>
    <p>Terima kasih atas dedikasi Anda,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Pembatalan Sesi Konseling - ${appName}`,
    });
};

module.exports = {
    untukMahasiswa,
    untukKonselor,
};