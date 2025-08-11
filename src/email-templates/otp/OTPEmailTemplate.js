const baseTemplate = require('../BaseTemplate');

module.exports = (appName, otpCode) => {
  const content = `
    <h3 style="margin-top: 0;">Kode OTP Anda</h3>
    <p>Gunakan kode berikut untuk melanjutkan proses verifikasi:</p>

    <div style="text-align: center; margin: 25px 0;">
      <div style="display: inline-block; font-size: 28px; letter-spacing: 4px; background: #f0f4ff; padding: 15px 25px; border-radius: 8px; font-weight: bold; color: #1e40af;">
        ${otpCode}
      </div>
    </div>

    <p class="text-muted">
      Kode ini berlaku selama 5 menit. Jangan berikan kode ini kepada siapa pun, termasuk pihak yang mengaku dari ${appName}.
    </p>
  `;

  return baseTemplate(content, appName, {
    title: `Kode OTP - ${appName}`,
  });
};
