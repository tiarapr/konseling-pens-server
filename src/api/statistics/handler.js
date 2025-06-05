const ClientError = require('./../../exceptions/ClientError');
const InvariantError = require('./../../exceptions/InvariantError');

class StatisticsHandler {
    constructor(statisticsService) {
        this._statisticsService = statisticsService;

        // Binding Handlers
        this.getDashboardSummaryHandler = this.getDashboardSummaryHandler.bind(this);
        this.getAverageRatingHandler = this.getAverageRatingHandler.bind(this);
        this.getAppointmentTrendsHandler = this.getAppointmentTrendsHandler.bind(this);
        this.getCounselorPerformanceHandler = this.getCounselorPerformanceHandler.bind(this);
        this.getConsultationTypesDistributionHandler = this.getConsultationTypesDistributionHandler.bind(this);
        this.getDepartmentStatsHandler = this.getDepartmentStatsHandler.bind(this);
        this.getTotalPengajuanPerProdiJenjangHandler = this.getTotalPengajuanPerProdiJenjangHandler.bind(this);
        this.getDemografiMahasiswaPerProdiHandler = this.getDemografiMahasiswaPerProdiHandler.bind(this);
        this.getDailySummaryHandler = this.getDailySummaryHandler.bind(this);
        this.getMonthlyAppointmentStatsHandler = this.getMonthlyAppointmentStatsHandler.bind(this);
        this.getTotalKonselingPerBulanPerStatusHandler = this.getTotalKonselingPerBulanPerStatusHandler.bind(this);
    }

    // Handler untuk mendapatkan ringkasan dashboard
    async getDashboardSummaryHandler(request, h) {
        try {
            const summary = await this._statisticsService.getDashboardSummary();
            return {
                status: 'success',
                data: { summary },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getAverageRatingHandler(request, h) {
        try {
            const ratingData = await this._statisticsService.getAverageRating();
            return {
                status: 'success',
                data: {
                    averageRating: ratingData.rata_rata_rating,
                    ratingCount: ratingData.jumlah_rating
                },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk mendapatkan tren janji temu
    async getAppointmentTrendsHandler(request, h) {
        try {
            const { days } = request.query;
            const trends = await this._statisticsService.getAppointmentTrends(days);
            return {
                status: 'success',
                data: { trends },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    async getMonthlyAppointmentStatsHandler(request, h) {
        try {
            const monthlyStats = await this._statisticsService.getMonthlyAppointmentStats();
            return {
                status: 'success',
                data: { monthlyStats },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk mendapatkan kinerja konselor
    async getCounselorPerformanceHandler(request, h) {
        try {
            const { limit } = request.query;
            const performance = await this._statisticsService.getCounselorPerformance(limit);
            return {
                status: 'success',
                data: { performance },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk mendapatkan total konseling per bulan dan per status
    async getTotalKonselingPerBulanPerStatusHandler(request, h) {
        try {
            const totalKonseling = await this._statisticsService.getTotalKonselingPerBulanPerStatus();
            return {
                status: 'success',
                data: { totalKonseling },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk distribusi jenis konsultasi
    async getConsultationTypesDistributionHandler(request, h) {
        try {
            const distribution = await this._statisticsService.getConsultationTypesDistribution();
            return {
                status: 'success',
                data: { distribution },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk mendapatkan statistik departemen
    async getDepartmentStatsHandler(request, h) {
        try {
            const stats = await this._statisticsService.getDepartmentStats();
            return {
                status: 'success',
                data: { stats },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk mendapatkan statistik pengajuan per prodi jenjang
    async getTotalPengajuanPerProdiJenjangHandler(request, h) {
        try {
            const totalPengajuan = await this._statisticsService.getTotalPengajuanPerProdiJenjang();
            return {
                status: 'success',
                data: { totalPengajuan },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk mendapatkan demografi mahasiswa per prodi
    async getDemografiMahasiswaPerProdiHandler(request, h) {
        try {
            const demografiMahasiswa = await this._statisticsService.getDemografiMahasiswaPerProdi();
            return {
                status: 'success',
                data: { demografiMahasiswa },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Handler untuk mendapatkan ringkasan harian
    async getDailySummaryHandler(request, h) {
        try {
            const { days } = request.query;
            const dailySummary = await this._statisticsService.getDailySummary(days);
            return {
                status: 'success',
                data: { dailySummary },
            };
        } catch (error) {
            return this._handleError(error, h);
        }
    }

    // Fungsi untuk menangani error
    _handleError(error, h) {
        if (error instanceof ClientError) {
            const statusCode = Number.isInteger(error.statusCode) ? error.statusCode : 400;
            return h.response({
                status: 'fail',
                message: error.message,
            }).code(statusCode);
        }

        if (error instanceof InvariantError) {
            return h.response({
                status: 'fail',
                message: error.message,
            }).code(400);
        }

        console.error(error);
        return h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
        }).code(500);
    }
}

module.exports = StatisticsHandler;
