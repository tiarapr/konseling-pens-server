const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Basic = require('@hapi/basic');
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
const tipeStatus = require('./api/tipe-status');
const status = require('./api/status');
const mahasiswa = require('./api/mahasiswa');
const janjiTemu = require('./api/janji-temu');
const konseling = require('./api/konseling');
const topik = require('./api/topik');
const catatanKonseling = require('./api/catatan-konseling');

// Importing services
const UserService = require('./services/UserService');
const RoleService = require('./services/RoleService');
const MailService = require('./services/MailService');
const AuthenticationService = require('./services/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const PermissionService = require('./services/PermissionService');
const RolePermissionService = require('./services/RolePermissionService');
const AdminProfilService = require('./services/AdminProfilService');
const KonselorProfilService = require('./services/KonselorProfilService');
const KemahasiswaanProfilService = require('./services/KemahasiswaanProfilService');
const DepartementService = require('./services/DepartementService');
const ProgramStudiService = require('./services/ProgramStudiService');
const TipeStatusService = require('./services/TipeStatusService');
const StatusService = require('./services/StatusService');
const MahasiswaService = require('./services/MahasiswaService');
const JanjiTemuService = require('./services/JanjiTemuService');
const KonselingService = require('./services/KonselingService');
const TopikService = require('./services/TopikService');
const KonselingTopikService = require('./services/KonselingTopikService');
const CatatanKonselingService = require('./services/CatatanKonselingService');

// Importing Validators
const RoleValidator = require('./validator/role');
const UserValidator = require('./validator/user');
const AuthenticationValidator = require('./validator/authentication');
const PermissionValidator = require('./validator/permission');
const AdminProfilValidator = require('./validator/admin-profil');
const KonselorProfilValidator = require('./validator/konselor-profil');
const KemahasiswaanProfilValidator = require('./validator/kemahasiswaan-profil');
const DepartementValidator = require('./validator/departement');
const ProgramStudiValidator = require('./validator/program-studi');
const TipeStatusValidator = require('./validator/tipe-status');
const StatusValidator = require('./validator/status');
const MahasiswaValidator = require('./validator/mahasiswa');
const JanjiTemuValidator = require('./validator/janji-temu');
const KonselingValidator = require('./validator/konseling');
const TopikValidator = require('./validator/topik');
const CatatanKonselingValidator = require('./validator/catatan-konseling');


const init = async () => {
  const userService = new UserService();
  const mailService = new MailService();
  const authenticationService = new AuthenticationService();
  const roleService = new RoleService();
  const permissionService = new PermissionService();
  const rolePermissionService = new RolePermissionService();
  const adminProfilService = new AdminProfilService();
  const konselorProfilService = new KonselorProfilService();
  const kemahasiswaanProfilService = new KemahasiswaanProfilService();
  const departementService = new DepartementService();
  const programStudiService = new ProgramStudiService();
  const tipeStatusService = new TipeStatusService();
  const statusService = new StatusService();
  const mahasiswaService = new MahasiswaService();
  const janjiTemuService = new JanjiTemuService();
  const konselingService = new KonselingService();
  const topikService = new TopikService();
  const konselingTopikService = new KonselingTopikService();
  const catatanKonselingService = new CatatanKonselingService();

  const server = Hapi.server({
    port: config.PORT,
    host: config.HOST,
    routes: {
      cors: { origin: ['*'] },
    },
  });

  await server.register([{ plugin: Jwt }, { plugin: Basic }]);

  // Register Basic Authentication Strategy
  server.auth.strategy('basic', 'basic', basicStrategy());

  // Register JWT Authentication Strategy
  server.auth.strategy('konselingapp_jwt', 'jwt', jwtStrategy());

  // Register Custom Authentication Scheme
  server.auth.scheme('basicAndJwt', basicAndJwtAuth);
  server.auth.strategy('basicAndJwtStrategy', 'basicAndJwt');

  // Register Plugins
  await server.register([
    {
      plugin: role,
      options: { service: roleService, validator: RoleValidator },
    },
    {
      plugin: user,
      options: { service: userService, validator: UserValidator, mailSender: mailService },
    },
    {
      plugin: authentication,
      options: { service: authenticationService, userService: userService, validator: AuthenticationValidator, tokenManager: TokenManager },
    },
    {
      plugin: permission,
      options: { service: permissionService, validator: PermissionValidator },
    },
    {
      plugin: rolePermission,
      options: { service: rolePermissionService, validator: PermissionValidator },
    },
    {
      plugin: adminProfil,
      options: { service: adminProfilService, userService: userService, mailSender: mailService, validator: AdminProfilValidator },
    },
    {
      plugin: konselorProfil,
      options: { service: konselorProfilService, userService: userService, mailSender: mailService, validator: KonselorProfilValidator },
    },
    {
      plugin: kemahasiswaanProfil,
      options: { service: kemahasiswaanProfilService, validator: KemahasiswaanProfilValidator },
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
      plugin: tipeStatus,
      options: { service: tipeStatusService, validator: TipeStatusValidator },
    },
    {
      plugin: status,
      options: { service: statusService, validator: StatusValidator },
    },
    {
      plugin: mahasiswa,
      options: { service: mahasiswaService, validator: MahasiswaValidator },
    },
    {
      plugin: janjiTemu,
      options: { service: janjiTemuService, validator: JanjiTemuValidator },
    },
    {
      plugin: konseling,
      options: { service: konselingService, validator: KonselingValidator },
    },
    {
      plugin: topik,
      options: { service: topikService, validator: TopikValidator },
    },
    {
      plugin: catatanKonseling,
      options: { service: catatanKonselingService, konselingTopikService: konselingTopikService, validator: CatatanKonselingValidator },
    }
  ]);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

init();
