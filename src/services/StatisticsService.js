const { Pool } = require('pg');
const ClientError = require('../exceptions/ClientError');

class StatisticsService {
    constructor() {
        this._pool = new Pool({
            connectionString: process.env.DATABASE_URL,
        });

        this.refreshInterval = 1000 * 60 * 60; // 1 hour
        this.startScheduledRefresh();
    }

    startScheduledRefresh() {
        this.refreshIntervalId = setInterval(() => {
            this.refreshMaterializedViews();
        }, this.refreshInterval);

        this.refreshMaterializedViews(); // Refresh immediately on start
    }

    stopScheduledRefresh() {
        if (this.refreshIntervalId) clearInterval(this.refreshIntervalId);
    }

    async refreshMaterializedViews() {
        try {
            await this._pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY mv_konselor_stats');
        } catch (error) {
            throw new ClientError('Error refreshing materialized views', error);
        }
    }

    async getDashboardSummary() {
        try {
            const query = `
                    WITH 
                    appointment_stats AS (
                        SELECT
                            COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total_appointments,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND created_at >= date_trunc('month', CURRENT_DATE)) AS monthly_appointments,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND created_at >= CURRENT_DATE) AS today_appointments,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'ditolak') AS rejected_appointments,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'menunggu_konfirmasi') AS pending_appointments,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND status = 'dikonfirmasi') AS confirmed_appointments
                        FROM janji_temu
                    ),
                    student_stats AS (
                        SELECT
                            COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total_students,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND is_active = TRUE) AS active_students,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND status_verifikasi_id = (
                                SELECT id FROM status_verifikasi WHERE kode_status = 'terverifikasi'
                            )) AS verified_students,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND status_verifikasi_id = (
                                SELECT id FROM status_verifikasi WHERE kode_status = 'menunggu_verifikasi'
                            )) AS pending_verification,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND status_verifikasi_id = (
                                SELECT id FROM status_verifikasi WHERE kode_status = 'revisi_diperlukan'
                            )) AS need_revision,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND status_verifikasi_id = (
                                SELECT id FROM status_verifikasi WHERE kode_status = 'ditolak'
                            )) AS rejected_students
                        FROM mahasiswa
                    ),
                    counselor_stats AS (
                        SELECT
                            COUNT(*) FILTER (WHERE deleted_at IS NULL) AS total_counselors,
                            COUNT(*) FILTER (WHERE deleted_at IS NULL AND id IN (
                                SELECT DISTINCT preferensi_konselor_id FROM janji_temu WHERE deleted_at IS NULL
                            )) AS active_counselors
                        FROM konselor_profil
                    ),
                    session_stats AS (
                        SELECT
                            COUNT(*) FILTER (WHERE k.deleted_at IS NULL) AS total_sessions,
                            COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'dijadwalkan') AS total_scheduled_sessions,
                            COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'berlangsung') AS total_in_progress_sessions,
                            COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'dibatalkan' OR s.kode_status = 'batal_otomatis') AS total_cancelled_sessions,
                            COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'selesai') AS total_completed_sessions,
                            COUNT(*) FILTER (WHERE k.deleted_at IS NULL AND k.status_kehadiran = TRUE) AS attended_sessions,
                            (COUNT(*) FILTER (WHERE k.deleted_at IS NULL AND k.status_kehadiran = TRUE) * 100.0 / NULLIF(COUNT(*) FILTER (WHERE k.deleted_at IS NULL), 0)) AS attendance_rate,
                        
                            -- Persentase sesi yang dijadwalkan
                            (COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'dijadwalkan') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE k.deleted_at IS NULL), 0)) AS scheduled_sessions_percentage,

                            -- Persentase sesi yang sedang berlangsung
                            (COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'berlangsung') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE k.deleted_at IS NULL), 0)) AS in_progress_sessions_percentage,

                            -- Persentase sesi yang dibatalkan
                            (COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'dibatalkan' OR s.kode_status = 'batal_otomatis') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE k.deleted_at IS NULL), 0)) AS cancelled_sessions_percentage,

                            -- Persentase sesi yang selesai
                            (COUNT(DISTINCT k.id) FILTER (WHERE s.kode_status = 'selesai') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE k.deleted_at IS NULL), 0)) AS completed_sessions_percentage

                        FROM konseling k
                        LEFT JOIN status s ON k.status_id = s.id
                    ),
                    waiting_time AS (
                        SELECT
                            AVG(EXTRACT(EPOCH FROM (status_changed_at - created_at))/3600) AS avg_waiting_hours,
                            MIN(EXTRACT(EPOCH FROM (status_changed_at - created_at))/3600) AS min_waiting_hours,
                            MAX(EXTRACT(EPOCH FROM (status_changed_at - created_at))/3600) AS max_waiting_hours
                        FROM janji_temu
                        WHERE deleted_at IS NULL 
                            AND status_changed_at IS NOT NULL
                            AND status = 'dikonfirmasi'
                    )
                    SELECT
                        a.*,
                        s.*,
                        c.*,
                        ss.*,
                        wt.*,
                        (a.confirmed_appointments * 100.0 / NULLIF(a.total_appointments, 0)) AS confirmation_rate
                    FROM appointment_stats a, student_stats s, counselor_stats c, session_stats ss, waiting_time wt;
                `;
            const { rows } = await this._pool.query(query);
            return rows[0];
        } catch (error) {
            throw new ClientError('Error getting dashboard summary', error);
        }
    }

    async getAppointmentTrends(days = 30) {
        try {
            const query = `
                    SELECT
                        date_trunc('day', created_at)::date AS date,
                        COUNT(*) AS total,
                        COUNT(*) FILTER (WHERE status = 'dikonfirmasi') AS confirmed,
                        COUNT(*) FILTER (WHERE status = 'ditolak') AS rejected,
                        COUNT(*) FILTER (WHERE status = 'menunggu_konfirmasi') AS pending
                    FROM janji_temu
                    WHERE deleted_at IS NULL
                        AND created_at >= CURRENT_DATE - $1::integer * INTERVAL '1 day'
                    GROUP BY date
                    ORDER BY date;
                `;
            const { rows } = await this._pool.query(query, [days]);
            return rows;
        } catch (error) {
            throw new ClientError('Error getting appointment trends', error);
        }
    }

    async getMonthlyAppointmentStats() {
        try {
            const query = `
                    SELECT TO_CHAR(created_at, 'YYYY-MM') AS month, COUNT(*) AS total_appointments
                    FROM janji_temu
                    WHERE deleted_at IS NULL
                    GROUP BY TO_CHAR(created_at, 'YYYY-MM')
                    ORDER BY TO_CHAR(created_at, 'YYYY-MM') DESC;
                `;
            const { rows } = await this._pool.query(query);
            return rows;
        } catch (error) {
            throw new ClientError('Error getting monthly appointment stats', error);
        }
    }

    async getCounselorPerformance(limit = 5) {
        try {
            const query = `
                    SELECT 
                        konselor AS counselor_name,
                        total_permintaan AS total_appointments,
                        total_sesi_konseling AS total_sessions,
                        total_sesi_dijadwalkan AS scheduled_sessions,
                        total_sesi_selesai AS completed_sessions,
                        total_sesi_dibatalkan AS canceled_sessions,
                        total_durasi_selesai_menit AS total_duration_completed_sessions,
                        rata_rating AS average_rating,
                        total_rating,
                        (total_sesi_selesai * 100.0 / NULLIF(total_sesi_konseling, 0)) AS completion_rate
                    FROM mv_konselor_stats
                    ORDER BY average_rating DESC NULLS LAST, completion_rate DESC NULLS LAST
                    LIMIT $1;
                `;
            const { rows } = await this._pool.query(query, [limit]);
            return rows;
        } catch (error) {
            throw new ClientError('Error getting counselor performance', error);
        }
    }

    async getConsultationTypesDistribution() {
        try {
            const query = `
                    SELECT
                        tipe_konsultasi AS consultation_type,
                        COUNT(*) AS count,
                        (COUNT(*) * 100.0 / SUM(COUNT(*)) OVER ()) AS percentage
                    FROM janji_temu
                    WHERE deleted_at IS NULL
                    GROUP BY tipe_konsultasi
                    ORDER BY count DESC;
                `;
            const { rows } = await this._pool.query(query);
            return rows;
        } catch (error) {
            throw new ClientError('Error getting consultation types distribution', error);
        }
    }

    async getDepartmentStats() {
        try {
            const query = `
                    SELECT
                        d.id AS department_id,
                        d.name AS department,
                        COUNT(DISTINCT m.id) AS total_students,
                        COUNT(DISTINCT jt.id) AS total_appointments,
                        COUNT(DISTINCT jt.id) FILTER (WHERE jt.status = 'menunggu_konfirmasi') AS pending_appointments,
                        COUNT(DISTINCT jt.id) FILTER (WHERE jt.status = 'dikonfirmasi') AS confirmed_appointments,
                        COUNT(DISTINCT jt.id) FILTER (WHERE jt.status = 'ditolak') AS rejected_appointments,
                        (COUNT(DISTINCT jt.id) * 100.0 / NULLIF(COUNT(DISTINCT m.id), 0)) AS appointment_rate
                    FROM departement d
                    LEFT JOIN program_studi ps ON d.id = ps.departement_id AND ps.deleted_at IS NULL
                    LEFT JOIN mahasiswa m ON ps.id = m.program_studi_id AND m.deleted_at IS NULL
                    LEFT JOIN janji_temu jt ON m.nrp = jt.nrp AND jt.deleted_at IS NULL
                    WHERE d.deleted_at IS NULL
                    GROUP BY d.id, d.name
                    ORDER BY total_appointments DESC;
                `;
            const { rows } = await this._pool.query(query);
            return rows;
        } catch (error) {
            throw new ClientError('Error getting department stats', error);
        }
    }

    async getTotalPengajuanPerProdiJenjang() {
        try {
            const query = `
                    SELECT 
                        jenjang,
                        nama_program_studi,
                        total_pengajuan
                    FROM total_pengajuan_per_prodi_jenjang_view
                    ORDER BY jenjang, total_pengajuan DESC;
                `;
            const { rows } = await this._pool.query(query);
            return rows;
        } catch (error) {
            throw new ClientError('Error fetching total pengajuan per prodi jenjang', error);
        }
    }

    async getDemografiMahasiswaPerProdi() {
        try {
            const query = `
                    SELECT 
                        departemen,
                        jenjang,
                        nama_program_studi,
                        total_mahasiswa
                    FROM view_demografi_mahasiswa_per_prodi
                    ORDER BY departemen, nama_program_studi;
                `;
            const { rows } = await this._pool.query(query);
            return rows;
        } catch (error) {
            throw new ClientError('Error fetching demografi mahasiswa per prodi', error);
        }
    }

    async getDailySummary(days = 7) {
        try {
            const query = `
                    SELECT
                        tanggal AS date,
                        total,
                        dikonfirmasi AS confirmed,
                        ditolak AS rejected,
                        menunggu_konfirmasi AS pending,
                        selesai AS completed,
                        (dikonfirmasi * 100.0 / NULLIF(total, 0)) AS confirmation_rate,
                        (selesai * 100.0 / NULLIF(total, 0)) AS completion_rate
                    FROM log_rekap_janji_temu_harian
                    ORDER BY date DESC
                    LIMIT $1;
                `;
            const { rows } = await this._pool.query(query, [days]);
            return rows;
        } catch (error) {
            throw new ClientError('Error getting daily summary', error);
        }
    }

    async getTotalKonselingPerBulanPerStatus() {
        try {
            const query = `
                SELECT 
                    bulan,
                    kode_status,
                    status_label,
                    status_warna,
                    total
                FROM view_total_konseling_per_bulan_per_status
                ORDER BY bulan DESC, status_label;
            `;
            const { rows } = await this._pool.query(query);
            return rows;
        } catch (error) {
            throw new ClientError('Error fetching total konseling per bulan per status', error);
        }
    }

    async getAverageRating() {
        try {
            const query = 'SELECT * FROM view_rata_rata_rating';
            const { rows } = await this._pool.query(query);

            return rows[0];
        } catch (error) {
            throw new ClientError('Error getting average rating', error);
        }
    }
}

module.exports = StatisticsService;