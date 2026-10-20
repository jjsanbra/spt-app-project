import { Module } from '@nestjs/common';
import { ClubsController } from './clubs.controller';
import { ClubsService } from './clubs.service';
import { ClubsMembersController } from './clubs-members.controller';
import { ClubsMembersService } from './clubs-members.service';

@Module({
  controllers: [ClubsController, ClubsMembersController],
  providers: [ClubsService, ClubsMembersService],
  exports: [ClubsService, ClubsMembersService],
})
export class ClubsModule {}
