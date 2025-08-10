const baseTemplate = require('../BaseTemplate');

const untukMahasiswa = (appName, namaMahasiswa, data) => {
    const content = `
    <h3 style="margin-top: 0;">Sesi Konseling Selesai</h3>
    <p>Halo <strong>${namaMahasiswa}</strong>,</p>
    <p>Konseling dengan Konselor <strong>${data.konselor}</strong> telah selesai!</p>

    <p><strong>📋 Catatan Hasil Konseling</strong><br>
    Anda dapat melihat catatan lengkap hasil konseling di dashboard Anda.</p>

    <p><strong>⭐ Berikan Rating dan Ulasan</strong><br>
    Kami sangat menghargai feedback Anda! Mohon luangkan waktu untuk memberikan rating dan ulasan mengenai sesi konseling ini, agar kami bisa terus meningkatkan kualitas layanan kami.</p>

    <p>Terima kasih telah menggunakan layanan konseling kami!</p>
    <p>Semoga sesi ini membantu Anda.</p>
  `;

    return baseTemplate(content, appName, {
        title: `Sesi Konseling Selesai - ${appName}`,
    });
};

module.exports = {
    untukMahasiswa,
};
