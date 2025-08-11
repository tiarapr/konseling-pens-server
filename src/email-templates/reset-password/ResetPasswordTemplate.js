const baseTemplate = require('../BaseTemplate');

module.exports = (appName, resetUrl, userName = '') => {
  const content = `
    <h3 style="margin-top: 0;">Reset Password</h3>
    ${userName ? `<p>Halo ${userName},</p>` : ''}
    <p>Kami menerima permintaan reset password untuk akun Anda di ${appName}.</p>
    
    <p>Silakan klik tombol di bawah ini untuk mengatur ulang password Anda:</p>
    
    <div style="text-align: center; margin: 25px 0;">
      <a href="${resetUrl}" class="button">Reset Password</a>
    </div>
    
    <p>Jika tombol di atas tidak bekerja, salin dan tempel link berikut di browser Anda:</p>
    <div class="detail">
      <a href="${resetUrl}">${resetUrl}</a>
    </div>
    
    <p class="text-muted">
      Link ini akan kadaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, 
      abaikan email ini atau hubungi tim support kami.
    </p>
  `;
  
  return baseTemplate(content, appName, {
    title: `Reset Password - ${appName}`,
  });
};