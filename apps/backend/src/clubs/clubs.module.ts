import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubDashboardController } from './club-dashboard.controller';
import { ClubsService } from './clubs.service';
import { ClubsMembersController } from './clubs-members.controller';
import { ClubsMembersService } from './clubs-members.service';

@Module({
  controllers: [ClubsController, ClubDashboardController, ClubsMembersController],
  providers: [ClubsService, ClubsMembersService],
  exports: [ClubsService, ClubsMembersService],
})
export class ClubsModule {}
