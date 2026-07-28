import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePlaceDto } from './dto/create-place.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import {
  Place,
  type GeoPoint,
} from './entities/place.entity';

@Injectable()
export class PlacesService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,
  ) {}

  async create(
    userId: string,
    dto: CreatePlaceDto,
  ): Promise<Place> {
    const location: GeoPoint = {
      type: 'Point',
      coordinates: [
        dto.longitude,
        dto.latitude,
      ],
    };

    const place = this.placesRepository.create({
      createdById: userId,
      name: dto.name.trim(),
      address: dto.address.trim(),
      city: dto.city.trim(),
      country: dto.country.trim(),
      category: dto.category.trim(),
      description: dto.description.trim(),
      openingHours: dto.openingHours ?? null,
      priceLevel: dto.priceLevel ?? null,
      tags:
        dto.tags?.map((tag) =>
          tag.trim().toLowerCase(),
        ) ?? [],
      ratingAverage: 0,
      reviewCount: 0,
      location,
    });

    return this.placesRepository.save(place);
  }

  async findAll(): Promise<Place[]> {
    return this.placesRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<Place> {
    const place =
      await this.placesRepository.findOneBy({
        id,
      });

    if (!place) {
      throw new NotFoundException(
        'Lieu introuvable.',
      );
    }

    return place;
  }

  async update(
    id: string,
    userId: string,
    dto: UpdatePlaceDto,
  ): Promise<Place> {
    const place = await this.findOne(id);

    this.checkOwnership(place, userId);

    if (dto.name !== undefined) {
      place.name = dto.name.trim();
    }

    if (dto.address !== undefined) {
      place.address = dto.address.trim();
    }

    if (dto.city !== undefined) {
      place.city = dto.city.trim();
    }

    if (dto.country !== undefined) {
      place.country = dto.country.trim();
    }

    if (dto.category !== undefined) {
      place.category = dto.category.trim();
    }

    if (dto.description !== undefined) {
      place.description = dto.description.trim();
    }

    if (dto.openingHours !== undefined) {
      place.openingHours = dto.openingHours;
    }

    if (dto.priceLevel !== undefined) {
      place.priceLevel = dto.priceLevel;
    }

    if (dto.tags !== undefined) {
      place.tags = dto.tags.map((tag) =>
        tag.trim().toLowerCase(),
      );
    }

    if (
      dto.latitude !== undefined ||
      dto.longitude !== undefined
    ) {
      const currentLongitude =
        place.location.coordinates[0];

      const currentLatitude =
        place.location.coordinates[1];

      place.location = {
        type: 'Point',
        coordinates: [
          dto.longitude ?? currentLongitude,
          dto.latitude ?? currentLatitude,
        ],
      };
    }

    return this.placesRepository.save(place);
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<void> {
    const place = await this.findOne(id);

    this.checkOwnership(place, userId);

    await this.placesRepository.remove(place);
  }

  private checkOwnership(
    place: Place,
    userId: string,
  ): void {
    if (place.createdById !== userId) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ou supprimer ce lieu.",
      );
    }
  }
}