require('dotenv').config();
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Basic = require('@hapi/basic');
const Inert = require('@hapi/inert');
const config = require('./config/config');
const basicAndJwtAuth = require('./auth/basicAndJwtAuth');
const jwtStrategy = require('./auth/jwtStrategy');
const basicStrategy = require('./auth/basicStrategy');

// Importing plugins
const role = require('./api/role');
const user = require('./api/user');
const authentication = require('./api/authentication');
const permission = require('./api/permission');
const rolePermission = require('./api/role-permission');
const adminProfil = require('./api/admin-profil');
const konselorProfil = require('./api/konselor-profil');
const kemahasiswaanProfil = require('./api/kemahasiswaan-profil');
const departement = require('./api/departement');
const programStudi = require('./api/program-studi');
const status = require('./api/status');
const statusVerifikasi = require('./api/status-verifikasi');
const mahasiswa = require('./api/mahasiswa');
const janjiTemu = require('./api/janji-temu');
const konseling = require('./api/konseling');
const catatanKonseling = require('./api/catatan-konseling');
const rating = require('./api/rating');
const statistics = require('./api/statistics')

// Importing services
const RoleService = require('./services/RoleService');
const UserService = require('./services/UserService');
const EmailVerificationService = require('./services/EmailVerificationService');
const PasswordResetService = require('./services/PasswordResetService');
const MailService = require('./services/MailService');
const AuthenticationService = require('./services/AuthenticationService');
const OTPService = require('./services/OTPService');
const WhatsAppService = require('./services/WhatsAppService');
const TokenManager = require('./tokenize/TokenManager');
const PermissionService = require('./services/PermissionService');
const RolePermissionService = require('./services/RolePermissionService');
const AdminProfilService = require('./services/AdminProfilService');
const KonselorProfilService = require('./services/KonselorProfilService');
const KemahasiswaanProfilService = require('./services/KemahasiswaanProfilService');
const DepartementService = require('./services/DepartementService');
const ProgramStudiService = require('./services/ProgramStudiService');
const StatusService = require('./services/StatusService');
const StatusVerifikasiService = require('./services/StatusVerifikasiService');
const MahasiswaService = require('./services/MahasiswaService');
const JanjiTemuService = require('./services/JanjiTemuService');
const KonselingService = require('./services/KonselingService');
const CatatanKonselingService = require('./services/CatatanKonselingService');
const FileStorageService = require('./services/FileStorageService');
const RatingService = require('./services/RatingService');
const StatisticsService  = require('./services/StatisticsService');

// Importing Validators
const RoleValidator = require('./validator/role');
const UserValidator = require('./validator/user');
const AuthenticationValidator = require('./validator/authentication');
const PermissionValidator = require('./validator/permission');
const RolePermissionValidator = require('./validator/role-permission');
const AdminProfilValidator = require('./validator/admin-profil');
const KonselorProfilValidator = require('./validator/konselor-profil');
const KemahasiswaanProfilValidator = require('./validator/kemahasiswaan-profil');
const DepartementValidator = require('./validator/departement');
const ProgramStudiValidator = require('./validator/program-studi');
const StatusValidator = require('./validator/status');
const StatusVerifikasiValidator = require('./validator/status-verifikasi');
const MahasiswaValidator = require('./validator/mahasiswa');
const JanjiTemuValidator = require('./validator/janji-temu');
const KonselingValidator = require('./validator/konseling');
const CatatanKonselingValidator = require('./validator/catatan-konseling');
const RatingValidator = require('./validator/rating');

const init = async () => {
  const roleService = new RoleService();
  const userService = new UserService();
  const emailVerificationService = new EmailVerificationService();
  const passwordResetService = new PasswordResetService();
  const mailService = new MailService();
  const authenticationService = new AuthenticationService();
  const otpService = new OTPService();
  const whatsappService = new WhatsAppService();
  const permissionService = new PermissionService();
  const rolePermissionService = new RolePermissionService();
  const adminProfilService = new AdminProfilService();
  const konselorProfilService = new KonselorProfilService();
  const kemahasiswaanProfilService = new KemahasiswaanProfilService();
  const departementService = new DepartementService();
  const programStudiService = new ProgramStudiService();
  const statusService = new StatusService();
  const statusVerifikasiService = new StatusVerifikasiService();
  const mahasiswaService = new MahasiswaService();
  const janjiTemuService = new JanjiTemuService();
  const konselingService = new KonselingService();
  const catatanKonselingService = new CatatanKonselingService();
  const fileStorageService = new FileStorageService();
  const ratingService = new RatingService();
  const statisticsService = new StatisticsService();

  const server = Hapi.server({
    port: config.PORT,
    host: config.HOST,
    routes: {
      cors: {
        origin: ['https://konseling-pens-client.vercel.app/'],
        credentials: true,
        headers: ['Authorization', 'Content-Type', 'Accept'],
      },
    },
  });

  await server.register([{ plugin: Jwt }, { plugin: Basic }, { plugin: Inert }]);

  // Register Basic Authentication Strategy
  server.auth.strategy('basic', 'basic', basicStrategy());

  // Register JWT Authentication Strategy
  server.auth.strategy('konselingapp_jwt', 'jwt', jwtStrategy());

  // Register Custom Authentication Scheme
  server.auth.scheme('basicAndJwt', basicAndJwtAuth);
  server.auth.strategy('basicAndJwtStrategy', 'basicAndJwt');

  server.route({
    method: 'OPTIONS',
    path: '/{any*}',
    handler: (request, h) => {
      return h.response()
        .header('Access-Control-Allow-Origin', '*')
        .header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')
        .header('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept')
        .header('Access-Control-Max-Age', 86400)
        .code(204);
    }
  });

  // Register Plugins
  await server.register([
    {
      plugin: role,
      options: { service: roleService, validator: RoleValidator },
    },
    {
      plugin: user,
      options: { service: userService, validator: UserValidator, emailVerificationService: emailVerificationService, passwordResetService: passwordResetService, mailSender: mailService },
    },
    {
      plugin: permission,
      options: { service: permissionService, validator: PermissionValidator },
    },
    {
      plugin: rolePermission,
      options: { service: rolePermissionService, validator: RolePermissionValidator },
    },
    {
      plugin: authentication,
      options: { service: authenticationService, userService: userService, validator: AuthenticationValidator, tokenManager: TokenManager, otpService: otpService, whatsappService: whatsappService, mailService: mailService, rolePermissionService: rolePermissionService },
    },
    {
      plugin: adminProfil,
      options: { service: adminProfilService, userService: userService, roleService: roleService, emailVerificationService: emailVerificationService, mailSender: mailService, fileStorageService: fileStorageService, validator: AdminProfilValidator },
    },
    {
      plugin: konselorProfil,
      options: { service: konselorProfilService, roleService: roleService, userService: userService, emailVerificationService: emailVerificationService, mailSender: mailService, fileStorageService: fileStorageService, validator: KonselorProfilValidator },
    },
    {
      plugin: kemahasiswaanProfil,
      options: { service: kemahasiswaanProfilService, roleService: roleService, userService: userService, emailVerificationService: emailVerificationService, mailSender: mailService, fileStorageService: fileStorageService, validator: KemahasiswaanProfilValidator },
    },
    {
      plugin: departement,
      options: { service: departementService, validator: DepartementValidator },
    },
    {
      plugin: programStudi,
      options: { service: programStudiService, validator: ProgramStudiValidator },
    },
    {
      plugin: status,
      options: { service: statusService, validator: StatusValidator },
    },
    {
      plugin: statusVerifikasi,
      options: { service: statusVerifikasiService, validator: StatusVerifikasiValidator },
    },
    {
      plugin: mahasiswa,
      options: { service: mahasiswaService, statusVerifikasiService: statusVerifikasiService, userService: userService, konselorProfileService: konselorProfilService, roleService: roleService, fileStorageService: fileStorageService, validator: MahasiswaValidator, emailVerificationService: emailVerificationService, mailSender: mailService },
    },
    {
      plugin: janjiTemu,
      options: { service: janjiTemuService, mahasiswaService: mahasiswaService, userService: userService, mailService: mailService, whatsappService: whatsappService, validator: JanjiTemuValidator },
    },
    {
      plugin: konseling,
      options: { service: konselingService, statusService: statusService, userService: userService, mahasiswaService: mahasiswaService, whatsappService: whatsappService, konselorProfileService: konselorProfilService, validator: KonselingValidator },
    },
    {
      plugin: catatanKonseling,
      options: { service: catatanKonselingService, statusService: statusService, konselingService: konselingService, validator: CatatanKonselingValidator },
    },
    {
      plugin: rating,
      options: { service: ratingService, validator: RatingValidator }
    },
    {
      plugin: statistics,
      options: { statisticsService: statisticsService }
    }
  ]);

  // Static file handler
  server.route({
    method: 'GET',
    path: '/storage/{param*}',
    handler: {
      directory: {
        path: './storage',
        redirectToSlash: true,
        index: false,
      }
    }
  });

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
