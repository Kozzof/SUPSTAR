import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Place } from '../places/entities/place.entity';
import { PlaceStatus } from './entities/place-status.entity';
import { PlaceStatusesController } from './place-statuses.controller';
import { PlaceStatusesService } from './place-statuses.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlaceStatus,
      Place,
    ]),
  ],
  controllers: [PlaceStatusesController],
  providers: [PlaceStatusesService],
  exports: [PlaceStatusesService],
})
export class PlaceStatusesModule {}