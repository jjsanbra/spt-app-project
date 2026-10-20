import {
  withNativeFederation,
  fromPackageJson,
} from '@angular-architects/native-federation/config';

/**
 * federation.config.mjs — Remote spt-users
 * Expone las rutas para carga lazy desde el shell host.
 */
export default withNativeFederation({
  name: 'spt-users',

  exposes: {
    './routes': './projects/spt-users/src/app/app.routes.ts',
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
