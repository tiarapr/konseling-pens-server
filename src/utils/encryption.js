const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const ivLength = 16;

if (!process.env.CRYPTO_KEY) {
  throw new Error('CRYPTO_KEY is not defined in environment variables');
}

const key = Buffer.from(process.env.CRYPTO_KEY, 'hex');

function encrypt(text) {
  if (typeof text !== 'string') {
    text = String(text); // Convert boolean or any other type to string
  }

  const iv = crypto.randomBytes(ivLength);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}


function decrypt(text) {
  if (typeof text !== 'string' || !text.includes(':')) {
    // Jika text bukan string atau tidak ada tanda ":" (format yang diharapkan)
    return text; // kembalikan nilai asli (bisa null, string biasa, dll.)
  }

  const [ivHex, encryptedData] = text.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

module.exports = { encrypt, decrypt };
