const { Pool } = require('pg');

class otpervice {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });
    }

    async saveOTP(email, otp, expiry) {
        // Pertama tandai semua OTP sebelumnya sebagai expired
        await this._pool.query(
            'UPDATE otp SET is_used = TRUE WHERE email = $1 AND is_used = FALSE',
            [email]
        );

        // Simpan OTP baru
        const query = {
            text: 'INSERT INTO otp(email, otp_code, expires_at) VALUES($1, $2, $3)',
            values: [email, otp, expiry],
        };
        await this._pool.query(query);
    }

    async verifyOTP(email, otp) {
        const query = {
            text: `SELECT otp_code, expires_at FROM otp 
                   WHERE email = $1 AND otp_code = $2 
                   AND is_used = FALSE AND expires_at > NOW()`,
            values: [email, otp],
        };

        const result = await this._pool.query(query);

        if (result.rows.length === 0) {
            return false;
        }

        // Tandai OTP sebagai digunakan setelah berhasil diverifikasi
        await this._pool.query(
            'UPDATE otp SET is_used = TRUE WHERE email = $1 AND otp_code = $2',
            [email, otp]
        );

        return true;
    }

    async deleteOTP(email) {
        await this._pool.query(
            'UPDATE otp SET is_used = TRUE WHERE email = $1 AND is_used = FALSE',
            [email]
        );
    }

    // Tambahan: Bersihkan OTP yang sudah expired
    async cleanExpiredotp() {
        await this._pool.query(
            'UPDATE otp SET is_used = TRUE WHERE expires_at <= NOW() AND is_used = FALSE'
        );
    }
}

module.exports = otpervice;