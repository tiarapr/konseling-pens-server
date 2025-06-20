const InvariantError = require('../exceptions/InvariantError');
const supabase = require('../config/supabase');

class FileStorageService {
  constructor() {
    this.allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
    this.maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  }

  _getContentTypeFromExtension(filename) {
    if (filename.endsWith('.jpg') || filename.endsWith('.jpeg')) return 'image/jpeg';
    if (filename.endsWith('.png')) return 'image/png';
    if (filename.endsWith('.webp')) return 'image/webp';
    return 'application/octet-stream';
  }

  async _validateAndReadFile(file) {
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

    return {
      buffer,
      contentType,
      originalFilename: file.hapi.filename,
    };
  }

  async _uploadToSupabase(buffer, contentType, pathInBucket) {
    const { error } = await supabase.storage
      .from('uploads')
      .upload(pathInBucket, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      throw new InvariantError(`Gagal upload ke Supabase Storage: ${error.message}`);
    }

    const { data } = supabase.storage
      .from('uploads')
      .getPublicUrl(pathInBucket);

    return {
      filePath: pathInBucket,
      url: data.publicUrl,
    };
  }

  async _saveFileToStorage(directory, file) {
    const { buffer, contentType, originalFilename } = await this._validateAndReadFile(file);
    const fileName = `${Date.now()}_${originalFilename}`;
    const fullPath = `${directory}/${fileName}`;
    return this._uploadToSupabase(buffer, contentType, fullPath);
  }

  async saveAdminPhotoFile(file) {
    return this._saveFileToStorage('admin', file);
  }

  async saveKonselorPhotoFile(file) {
    return this._saveFileToStorage('konselor', file);
  }

  async saveKemahasiswaanPhotoFile(file) {
    return this._saveFileToStorage('kemahasiswaan', file);
  }

  async saveKtmFile(file) {
    return this._saveFileToStorage('mahasiswa/ktm', file);
  }
}

module.exports = FileStorageService;
