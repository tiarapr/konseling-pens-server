const Boom = require('@hapi/boom');

const checkPermission = (...permissions) => {
  // Flatten jika nested array
  const requiredPermissions = permissions.flat();

  return (request, h) => {
    const jwtPayload = request.auth.credentials.jwt.user;
    const userPermissions = jwtPayload?.permissions || [];

    const hasPermission = requiredPermissions.some((perm) =>
      userPermissions.includes(perm)
    );

    console.log('JWT payload:', jwtPayload);
    console.log('User permissions:', userPermissions);
    console.log('Required permissions:', requiredPermissions);

    if (hasPermission) {
      return h.continue;
    }

    throw Boom.forbidden(
      `Akses ditolak. Anda tidak memiliki izin untuk melakukan tindakan ini.`
    );
  };
};

module.exports = checkPermission;
