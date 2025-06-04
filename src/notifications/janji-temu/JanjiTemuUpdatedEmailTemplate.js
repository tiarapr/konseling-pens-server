const baseTemplate = require('../BaseTemplate');

module.exports = (appName, namaMahasiswa, data) => {
    const content = `
    <h3 style="margin-top: 0;">Status Janji Temu Anda Diperbarui!</h3>
    <p>Halo ${namaMahasiswa},</p>
    <p>Status pengajuan janji temu Anda telah kami perbarui dengan detail sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Nomor Tiket:</strong><br>${data.nomor_tiket}</p>
      <p><strong>Jenis Konsultasi:</strong><br>${data.tipe_konsultasi}</p>
      <p><strong>Jadwal Utama:</strong><br>${data.jadwal_utama}</p>
      <p><strong>Jadwal Alternatif:</strong><br>${data.jadwal_alternatif}</p>
      <p><strong>Status:</strong> ${data.status}</p>
    </div>
    
    <p>Kami akan segera menginformasikan jadwal yang dikonfirmasi.</p>
    <p>Harap pantau email Anda untuk informasi lebih lanjut.</p>
  `;

    return baseTemplate(content, appName, {
        title: `Janji Temu - ${appName}`,
    });
};
