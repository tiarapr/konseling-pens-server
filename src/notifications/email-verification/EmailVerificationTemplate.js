const baseTemplate = require('../BaseTemplate');

module.exports = (appName, verificationUrl) => {
  const content = `
    <h3 style="margin-top: 0;">Verifikasi Email Anda</h3>
    <p>Silakan klik tombol di bawah untuk memverifikasi alamat email Anda:</p>
    
    <a href="${verificationUrl}" class="button">
      Verifikasi Email
    </a>
    
    <p>Jika tombol di atas tidak bekerja, salin dan tempel link berikut di browser Anda:</p>
    <div class="detail">
      <a href="${verificationUrl}">${verificationUrl}</a>
    </div>
    
    <p class="text-muted">
      Link ini akan kadaluarsa dalam 24 jam. Jika Anda tidak merasa mendaftar di ${appName}, 
      abaikan email ini.
    </p>
  `;

  return baseTemplate(content, appName, {
    title: `Verifikasi Email - ${appName}`,
  });
};