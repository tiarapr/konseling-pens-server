const routes = (handler) => [
    {
        method: 'GET',
        path: '/dashboard/summary',
        handler: handler.getDashboardSummaryHandler,
    },
    {
        method: 'GET',
        path: '/janji-temu/trends',
        handler: handler.getAppointmentTrendsHandler,
    },
    {
        method: 'GET',
        path: '/janji-temu/monthly-summary',
        handler: handler.getMonthlyAppointmentStatsHandler, 
    },
    {
        method: 'GET',
        path: '/konseling/monthly-summary',
        handler: handler.getTotalKonselingPerBulanPerStatusHandler, 
    },
    {
        method: 'GET',
        path: '/konselor/performance',
        handler: handler.getCounselorPerformanceHandler,
    },
    {
        method: 'GET',
        path: '/janji-temu/consultation-types',
        handler: handler.getConsultationTypesDistributionHandler,
    },
    {
        method: 'GET',
        path: '/department/stats',
        handler: handler.getDepartmentStatsHandler,
    },
    {
        method: 'GET',
        path: '/janji-temu/prodi/stats',
        handler: handler.getTotalPengajuanPerProdiJenjangHandler,
    },
    {
        method: 'GET',
        path: '/mahasiswa/prodi/stats',
        handler: handler.getDemografiMahasiswaPerProdiHandler,
    },
    {
        method: 'GET',
        path: '/daily-summary',
        handler: handler.getDailySummaryHandler,
    },
    {
        method: 'GET',
        path: '/rating/average',
        handler: handler.getAverageRatingHandler,
    },
];

module.exports = routes;
