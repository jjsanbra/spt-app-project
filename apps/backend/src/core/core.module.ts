import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';

/**
 * CoreModule — Módulo global de infraestructura.
 * Al ser @Global(), sus providers están disponibles en toda la app
 * sin necesidad de importar este módulo en cada feature module.
 */
@Global()
@Module({
  imports: [DatabaseModule],
  exports: [DatabaseModule],
})
export class CoreModule {}
