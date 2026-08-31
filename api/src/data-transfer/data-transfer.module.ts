import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Place } from '../places/entities/place.entity';
import { PlacesModule } from '../places/places.module';
import { DataTransferController } from './data-transfer.controller';
import { DataTransferService } from './data-transfer.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Place,
    ]),
    PlacesModule,
  ],
  controllers: [
    DataTransferController,
  ],
  providers: [
    DataTransferService,
  ],
})
export class DataTransferModule {}