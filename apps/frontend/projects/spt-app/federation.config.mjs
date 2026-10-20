import {
  withNativeFederation,
  fromPackageJson,
} from '@angular-architects/native-federation/config';

/**
 * federation.config.mjs — Shell Host (spt-app)
 * Puerto: 4200
 *
 * URLs de remotes dinámicas según entorno:
 * - Desarrollo: localhost con puertos fijos
 * - Producción (Render): variables de entorno MFE_*_URL
 */
const isProduction = process.env['NODE_ENV'] === 'production';

const remoteUrls = {
  admin:  isProduction ? (process.env['MFE_ADMIN_URL']  || 'https://spt-admin.onrender.com')  : 'http://localhost:4201',
  portal: isProduction ? (process.env['MFE_PORTAL_URL'] || 'https://spt-portal.onrender.com') : 'http://localhost:4202',
  users:  isProduction ? (process.env['MFE_USERS_URL']  || 'https://spt-users.onrender.com')  : 'http://localhost:4203',
};

export default withNativeFederation({
  name: 'spt-app',

  remotes: {
    'spt-admin':  `${remoteUrls.admin}/remoteEntry.json`,
    'spt-portal': `${remoteUrls.portal}/remoteEntry.json`,
    'spt-users':  `${remoteUrls.users}/remoteEntry.json`,
  },

  shared: fromPackageJson({
    singleton: true,
    strictVersion: true,
    requiredVersion: 'auto',
    build: 'package',
  })
    .patch(['@angular/*'], { includeSecondaries: { keepAll: true } })
    .get(),

  skip: [
    'rxjs/ajax',
    'rxjs/fetch',
    'rxjs/testing',
    'rxjs/webSocket',
    'socket.io-client',
    'zone.js',
  ],

  features: {
    denseChunking: true,
    denseExternals: true,
    strictImports: false,
  },
});
