import { Module } from '@nestjs/common';
import { FacilitiesController } from './facilities.controller';
import { FacilitiesService } from './facilities.service';
import { FacilitiesAvailabilityService } from './facilities-availability.service';

@Module({
  controllers: [FacilitiesController],
  providers: [FacilitiesService, FacilitiesAvailabilityService],
  exports: [FacilitiesService, FacilitiesAvailabilityService],
})
export class FacilitiesModule {}
