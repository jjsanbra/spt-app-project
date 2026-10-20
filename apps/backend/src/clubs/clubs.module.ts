import { Module } from '@nestjs/common';
import { ClubsMembersController } from './clubs-members.controller';
import { ClubsMembersService } from './clubs-members.service';

@Module({
  controllers: [ClubsMembersController],
  providers: [ClubsMembersService],
  exports: [ClubsMembersService],
})
export class ClubsModule {}
