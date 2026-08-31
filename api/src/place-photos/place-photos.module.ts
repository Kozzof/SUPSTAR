import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Place } from '../places/entities/place.entity';
import { PlacePhoto } from './entities/place-photo.entity';
import { PlacePhotosController } from './place-photos.controller';
import { PlacePhotosService } from './place-photos.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlacePhoto,
      Place,
    ]),
  ],
  controllers: [
    PlacePhotosController,
  ],
  providers: [
    PlacePhotosService,
  ],
  exports: [
    PlacePhotosService,
  ],
})
export class PlacePhotosModule {}