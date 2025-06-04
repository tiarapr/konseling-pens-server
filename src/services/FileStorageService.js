const fs = require('fs');
const path = require('path');
const InvariantError = require('../exceptions/InvariantError');
const { Readable } = require('stream');

class FileStorageService {
  constructor() {
    this.storagePath = path.resolve(__dirname, '../../storage/upload/user');
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    this.maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  }

  async _validateAndReadBuffer(file) {
    if (!file || !file.hapi || !file.hapi.filename) {
      throw new InvariantError('File tidak valid.');
    }

    const contentType = file.hapi.headers['content-type'];

    if (!this.allowedImageTypes.includes(contentType)) {
      throw new InvariantError('Jenis file tidak diperbolehkan. Gunakan JPG, PNG, atau WebP.');
    }

    const chunks = [];
    for await (const chunk of file) {
      chunks.push(chunk);
    }

    const buffer = Buffer.concat(chunks);

    if (buffer.length > this.maxSizeInBytes) {
      throw new InvariantError('Ukuran file melebihi batas maksimal 2MB.');
    }

    return buffer;
  }

  async _saveBufferToFile(buffer, directory, originalFilename) {
    const targetPath = path.join(this.storagePath, directory);

    if (!fs.existsSync(targetPath)) {
      fs.mkdirSync(targetPath, { recursive: true });
    }

    const fileName = `${Date.now()}_${originalFilename}`;
    const filePath = path.join(targetPath, fileName);

    return new Promise((resolve, reject) => {
      const readable = Readable.from(buffer);
      const writeStream = fs.createWriteStream(filePath);

      readable.pipe(writeStream);
      writeStream.on('finish', () => {
        resolve({
          fileName,
          filePath,
          url: `/storage/upload/user/${directory}/${fileName}`,
        });
      });

      writeStream.on('error', () => {
        reject(new InvariantError(`Gagal menyimpan file ke folder ${directory}`));
      });
    });
  }

  async saveAdminPhotoFile(file) {
    const buffer = await this._validateAndReadBuffer(file);
    return this._saveBufferToFile(buffer, 'admin', file.hapi.filename);
  }

  async saveKonselorPhotoFile(file) {
    const buffer = await this._validateAndReadBuffer(file);
    return this._saveBufferToFile(buffer, 'konselor', file.hapi.filename);
  }

  async saveKemahasiswaanPhotoFile(file) {
    const buffer = await this._validateAndReadBuffer(file);
    return this._saveBufferToFile(buffer, 'kemahasiswaan', file.hapi.filename);
  }

  async saveKtmFile(file) {
    const buffer = await this._validateAndReadBuffer(file);
    return this._saveBufferToFile(buffer, 'mahasiswa/ktm', file.hapi.filename);
  }
}

module.exports = FileStorageService;
