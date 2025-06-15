const baseTemplate = require('../BaseTemplate');

const untukMahasiswaJikaTidakHadir = (appName, namaMahasiswa, data) => {
    const content = `
    <h3 style="margin-top: 0;">Informasi Konfirmasi Kehadiran</h3>
    <p>Halo <strong>${namaMahasiswa}</strong>,</p>
    <p>Kami ingin memberitahukan adanya pembaruan terkait sesi konseling Anda dengan informasi sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Konselor:</strong><br>${data.konselor}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status ? `<p><strong>Status Konseling:</strong><br>${data.status}</p>` : ''}
      ${data.status_kehadiran ? `<p><strong>Status Konfirmasi:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>
    
    <p>Bahwa sesi konseling ini telah dibatalkan secara otomatis karena konfirmasi ketidakhadiran. Silakan kunjungi dashboard sistem Anda untuk informasi lebih lanjut.</p>
    <p>Terima kasih,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Konfirmasi Kehadiran Sesi Konseling - ${appName}`,
    });
};

const untukMahasiswaJikaHadir = (appName, namaMahasiswa, data) => {
    const content = `
    <h3 style="margin-top: 0;">Informasi Konfirmasi Kehadiran</h3>
    <p>Halo <strong>${namaMahasiswa}</strong>,</p>
    <p>Terima kasih telah mengonfirmasi kehadiran Anda pada sesi konseling berikut:</p>
    
    <div class="detail">
      <p><strong>Konselor:</strong><br>${data.konselor}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status_kehadiran ? `<p><strong>Status Konfirmasi:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>
    
    <p><strong>Catatan Penting:<strong></p>
    <p>Untuk sesi offline: Harap hadir sesuai jadwal dan lokasi, serta membawa Kartu Tanda Mahasiswa (KTM).</p>
    <p>Untuk sesi online: Sesi akan berlangsung via chat WhatsApp. Konselor akan menghubungi Anda melalui nomor yang terdaftar di sistem.</p>
    <p>Terima kasih,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Konfirmasi Kehadiran Sesi Konseling - ${appName}`,
    });
};

const untukAdminJikaMahasiswaTidakHadir = (appName, namaKonselor, data) => {
    const content = `
    <h3 style="margin-top: 0;">Pemberitahuan Konfirmasi Kehadiran Mahasiswa</h3>
    <p>Halo Admin,</p>
    <p>Mahasiswa telah mengonfirmasi kehadirannya untuk sesi konseling. Berikut pembaruan terkait sesi tersebut:</p>
    
    <div class="detail">
      <p><strong>Mahasiswa:</strong><br>${data.mahasiswa}</p>
      <p><strong>Mahasiswa:</strong><br>${data.konselor}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status ? `<p><strong>Status Konseling:</strong><br>${data.status}</p>` : ''}
      ${data.status_kehadiran ? `<p><strong>Konfirmasi Kehadiran Mahasiswa:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>

    <p>Bahwa sesi konseling ini telah dibatalkan secara otomatis karena konfirmasi ketidakhadiran dari pihak mahasiswa.</p>
    <p>Silakan kunjungi dashboard sistem Anda untuk informasi lebih lanjut.</p>
    <p>Terima kasih atas dedikasi Anda,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Konfirmasi Kehadiran Sesi Konseling - ${appName}`,
    });
};

const untukAdminJikaMahasiswaHadir = (appName, namaKonselor, data) => {
    const content = `
    <h3 style="margin-top: 0;">Sesi Konseling Terkonfirmasi</h3>
    <p>Halo Admin,</p>
    <p>Mahasiswa telah mengkonfirmasi kehadiran sesi konseling dengan detail sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Mahasiswa:</strong><br>${data.mahasiswa}</p>
      <p><strong>Konselor:</strong><br>${data.konselor}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status_kehadiran ? `<p><strong>Konfirmasi Kehadiran Mahasiswa:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>

    <p>Silakan kunjungi dashboard sistem Anda untuk informasi lebih lanjut.</p>
    <p>Terima kasih atas dedikasi Anda,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Konfirmasi Kehadiran Sesi Konseling - ${appName}`,
    });
};

const untukKonselorJikaMahasiswaTidakHadir = (appName, namaKonselor, data) => {
    const content = `
    <h3 style="margin-top: 0;">Pemberitahuan Konfirmasi Kehadiran Mahasiswa</h3>
    <p>Halo <strong>${namaKonselor}</strong>,</p>
    <p>Kami ingin memberitahukan adanya pembaruan terkait sesi konseling Anda dengan informasi sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Mahasiswa:</strong><br>${data.mahasiswa}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status ? `<p><strong>Status Konseling:</strong><br>${data.status}</p>` : ''}
      ${data.status_kehadiran ? `<p><strong>Konfirmasi Kehadiran Mahasiswa:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>

    <p>Bahwa sesi konseling ini telah dibatalkan secara otomatis karena konfirmasi ketidakhadiran dari pihak mahasiswa.</p>
    <p>Silakan kunjungi dashboard sistem Anda untuk informasi lebih lanjut.</p>
    <p>Terima kasih atas dedikasi Anda,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Konfirmasi Kehadiran Sesi Konseling - ${appName}`,
    });
};

const untukKonselorJikaMahasiswaHadir = (appName, namaKonselor, data) => {
    const content = `
    <h3 style="margin-top: 0;">Sesi Konseling Terkonfirmasi</h3>
    <p>Halo <strong>${namaKonselor}</strong>,</p>
    <p>Mahasiswa telah mengkonfirmasi kehadiran sesi konseling dengan detail sebagai berikut:</p>
    
    <div class="detail">
      <p><strong>Mahasiswa:</strong><br>${data.mahasiswa}</p>
      <p><strong>Tanggal:</strong><br>${data.tanggal}</p>
      <p><strong>Waktu:</strong><br>${data.waktu}</p>
      <p><strong>Lokasi:</strong><br>${data.lokasi}</p>
      ${data.status_kehadiran ? `<p><strong>Konfirmasi Kehadiran Mahasiswa:</strong><br>${data.status_kehadiran}</p>` : ''}
    </div>

    <p>Mohon siapkan diri untuk sesi ini. Silakan kunjungi dashboard sistem Anda untuk informasi lebih lanjut.</p>
    <p>Terima kasih atas dedikasi Anda,</p>
    <p>Tim ${appName}</p>
  `;

    return baseTemplate(content, appName, {
        title: `Konfirmasi Kehadiran Sesi Konseling - ${appName}`,
    });
};

module.exports = {
    untukMahasiswaJikaTidakHadir,
    untukMahasiswaJikaHadir,
    untukAdminJikaMahasiswaHadir,
    untukAdminJikaMahasiswaTidakHadir,
    untukKonselorJikaMahasiswaHadir,
    untukKonselorJikaMahasiswaTidakHadir
};