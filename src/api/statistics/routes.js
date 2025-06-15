const routes = (handler) => [
    {
        method: 'GET',
        path: '/dashboard/summary',
        handler: handler.getDashboardSummaryHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/janji-temu/trends',
        handler: handler.getAppointmentTrendsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/janji-temu/monthly-summary',
        handler: handler.getMonthlyAppointmentStatsHandler, 
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/konseling/monthly-summary',
        handler: handler.getTotalKonselingPerBulanPerStatusHandler, 
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/konselor/performance',
        handler: handler.getCounselorPerformanceHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/janji-temu/consultation-types',
        handler: handler.getConsultationTypesDistributionHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/department/stats',
        handler: handler.getDepartmentStatsHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/janji-temu/prodi/stats',
        handler: handler.getTotalPengajuanPerProdiJenjangHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/mahasiswa/prodi/stats',
        handler: handler.getDemografiMahasiswaPerProdiHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/daily-summary',
        handler: handler.getDailySummaryHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
    {
        method: 'GET',
        path: '/rating/average',
        handler: handler.getAverageRatingHandler,
        options: {
            auth: 'basicAndJwtStrategy',
        },
    },
];

module.exports = routes;
