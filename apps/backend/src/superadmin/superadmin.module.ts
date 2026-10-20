import { Module } from '@nestjs/common';
import { SuperAdminClubsController } from './superadmin-clubs.controller';
import { SuperAdminClubsService } from './superadmin-clubs.service';

@Module({
  controllers: [SuperAdminClubsController],
  providers: [SuperAdminClubsService],
  exports: [SuperAdminClubsService],
})
export class SuperAdminModule {}
