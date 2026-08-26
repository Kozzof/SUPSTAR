import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Place } from '../places/entities/place.entity';
import { UpdatePlaceStatusDto } from './dto/update-place-status.dto';
import { PlaceStatus } from './entities/place-status.entity';

@Injectable()
export class PlaceStatusesService {
  constructor(
    @InjectRepository(PlaceStatus)
    private readonly placeStatusesRepository: Repository<PlaceStatus>,

    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,
  ) {}

  async findForUserAndPlace(
    userId: string,
    placeId: string,
  ): Promise<PlaceStatus | null> {
    await this.ensurePlaceExists(placeId);

    return this.placeStatusesRepository.findOne({
      where: {
        userId,
        placeId,
      },
    });
  }

  async update(
    userId: string,
    placeId: string,
    dto: UpdatePlaceStatusDto,
  ): Promise<PlaceStatus> {
    await this.ensurePlaceExists(placeId);

    let status =
      await this.placeStatusesRepository.findOne({
        where: {
          userId,
          placeId,
        },
      });

    if (!status) {
      status = this.placeStatusesRepository.create({
        userId,
        placeId,
        visited: false,
        wantToVisit: false,
        favorite: false,
      });
    }

    if (dto.visited !== undefined) {
      status.visited = dto.visited;

      if (dto.visited) {
        status.wantToVisit = false;
      }
    }

    if (dto.wantToVisit !== undefined) {
      status.wantToVisit = dto.wantToVisit;

      if (dto.wantToVisit) {
        status.visited = false;
      }
    }

    if (dto.favorite !== undefined) {
      status.favorite = dto.favorite;
    }

    return this.placeStatusesRepository.save(status);
  }

  private async ensurePlaceExists(
    placeId: string,
  ): Promise<void> {
    const exists = await this.placesRepository.exists({
      where: {
        id: placeId,
      },
    });

    if (!exists) {
      throw new NotFoundException(
        'Lieu introuvable.',
      );
    }
  }
}