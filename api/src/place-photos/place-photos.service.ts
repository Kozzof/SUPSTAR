import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  QueryFailedError,
  Repository,
} from 'typeorm';

import { Place } from '../places/entities/place.entity';
import { CreatePlacePhotoDto } from './dto/create-place-photo.dto';
import { PlacePhoto } from './entities/place-photo.entity';

@Injectable()
export class PlacePhotosService {
  constructor(
    @InjectRepository(PlacePhoto)
    private readonly photosRepository: Repository<PlacePhoto>,

    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,
  ) {}

  async findAll(
    placeId: string,
  ): Promise<PlacePhoto[]> {
    await this.findPlaceOrFail(
      placeId,
    );

    return this.photosRepository.find({
      where: {
        placeId,
      },
      order: {
        displayOrder: 'ASC',
        createdAt: 'ASC',
      },
    });
  }

  async create(
    userId: string,
    placeId: string,
    dto: CreatePlacePhotoDto,
  ): Promise<PlacePhoto> {
    const place =
      await this.findPlaceOrFail(
        placeId,
      );

    this.checkOwnership(
      place,
      userId,
    );

    try {
      const photo =
        this.photosRepository.create({
          placeId,
          addedById: userId,
          url: dto.url.trim(),
          caption:
            dto.caption?.trim() ||
            null,
          displayOrder:
            dto.displayOrder ?? 0,
        });

      return await this.photosRepository.save(
        photo,
      );
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        this.isUniqueConstraintViolation(
          error,
        )
      ) {
        throw new ConflictException(
          'Cette photo est déjà associée à ce lieu.',
        );
      }

      throw error;
    }
  }

  async remove(
    userId: string,
    placeId: string,
    photoId: string,
  ): Promise<void> {
    const place =
      await this.findPlaceOrFail(
        placeId,
      );

    this.checkOwnership(
      place,
      userId,
    );

    const photo =
      await this.photosRepository.findOne({
        where: {
          id: photoId,
          placeId,
        },
      });

    if (!photo) {
      throw new NotFoundException(
        'Photo introuvable.',
      );
    }

    await this.photosRepository.remove(
      photo,
    );
  }

  private async findPlaceOrFail(
    placeId: string,
  ): Promise<Place> {
    const place =
      await this.placesRepository.findOneBy({
        id: placeId,
      });

    if (!place) {
      throw new NotFoundException(
        'Lieu introuvable.',
      );
    }

    return place;
  }

  private checkOwnership(
    place: Place,
    userId: string,
  ): void {
    if (
      place.createdById !== userId
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à gérer les photos de ce lieu.",
      );
    }
  }

  private isUniqueConstraintViolation(
    error: QueryFailedError,
  ): boolean {
    const driverError =
      error.driverError as {
        code?: string;
      };

    return driverError.code === '23505';
  }
}