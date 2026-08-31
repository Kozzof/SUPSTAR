import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePlaceDto } from './dto/create-place.dto';
import { SearchPlacesDto } from './dto/search-places.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import {
  Place,
  type GeoPoint,
} from './entities/place.entity';

export interface SearchPlacesResult {
  items: Place[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

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
    const duplicate = await this.placesRepository
      .createQueryBuilder('place')
      .where(
        'LOWER(place.name) = LOWER(:name)',
        {
          name: dto.name.trim(),
        },
      )
      .andWhere(
        'LOWER(place.address) = LOWER(:address)',
        {
          address: dto.address.trim(),
        },
      )
      .andWhere(
        'LOWER(place.city) = LOWER(:city)',
        {
          city: dto.city.trim(),
        },
      )
      .andWhere(
        'LOWER(place.country) = LOWER(:country)',
        {
          country: dto.country.trim(),
        },
      )
      .getOne();

    if (duplicate) {
      throw new ConflictException(
        'Ce lieu existe déjà.',
      );
    }

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
      openingHours:
        dto.openingHours ?? null,
      priceLevel:
        dto.priceLevel ?? null,
      tags:
        dto.tags?.map(
          (tag) =>
            tag.trim().toLowerCase(),
        ) ?? [],
      ratingAverage: 0,
      reviewCount: 0,
      location,
    });

    return this.placesRepository.save(
      place,
    );
  }

  async search(
    userId: string,
    dto: SearchPlacesDto,
  ): Promise<SearchPlacesResult> {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const query =
      this.placesRepository
        .createQueryBuilder('place');

    if (
      dto.search &&
      dto.search.trim().length > 0
    ) {
      const search = dto.search.trim();

      query.andWhere(
        `
        (
          to_tsvector(
            'simple',
            concat_ws(
              ' ',
              place.name,
              place.description,
              place.city,
              place.country,
              place.category,
              array_to_string(place.tags, ' ')
            )
          )
          @@ plainto_tsquery(
            'simple',
            :search
          )
          OR place.name ILIKE :partialSearch
        )
        `,
        {
          search,
          partialSearch: `%${search}%`,
        },
      );
    }

    if (dto.category) {
      query.andWhere(
        'LOWER(place.category) = LOWER(:category)',
        {
          category:
            dto.category.trim(),
        },
      );
    }

    if (dto.city) {
      query.andWhere(
        'LOWER(place.city) = LOWER(:city)',
        {
          city: dto.city.trim(),
        },
      );
    }

    if (
      dto.minRating !== undefined
    ) {
      query.andWhere(
        'place.ratingAverage >= :minRating',
        {
          minRating:
            dto.minRating,
        },
      );
    }

    if (
      dto.maxPrice !== undefined
    ) {
      query.andWhere(
        `
        place.priceLevel IS NOT NULL
        AND place.priceLevel <= :maxPrice
        `,
        {
          maxPrice:
            dto.maxPrice,
        },
      );
    }

    if (
      dto.tags &&
      dto.tags.trim().length > 0
    ) {
      const tags = dto.tags
        .split(',')
        .map(
          (tag) =>
            tag
              .trim()
              .toLowerCase(),
        )
        .filter(
          (tag) =>
            tag.length > 0,
        );

      if (tags.length > 0) {
        query.andWhere(
          'place.tags && :tags',
          {
            tags,
          },
        );
      }
    }

    if (dto.status) {
      query.innerJoin(
        'place_statuses',
        'personal_status',
        `
        personal_status.place_id = place.id
        AND personal_status.user_id = :userId
        `,
        {
          userId,
        },
      );

      if (
        dto.status ===
        'visited'
      ) {
        query.andWhere(
          'personal_status.visited = true',
        );
      }

      if (
        dto.status ===
        'wantToVisit'
      ) {
        query.andWhere(
          'personal_status.want_to_visit = true',
        );
      }

      if (
        dto.status ===
        'favorite'
      ) {
        query.andWhere(
          'personal_status.favorite = true',
        );
      }
    }

    const hasLatitude =
      dto.latitude !== undefined;

    const hasLongitude =
      dto.longitude !== undefined;

    if (
      hasLatitude !== hasLongitude
    ) {
      throw new BadRequestException(
        'Latitude et longitude doivent être fournies ensemble.',
      );
    }

    if (
      dto.radiusKm !== undefined &&
      (!hasLatitude ||
        !hasLongitude)
    ) {
      throw new BadRequestException(
        'Un rayon nécessite une latitude et une longitude.',
      );
    }

    if (
      hasLatitude &&
      hasLongitude
    ) {
      const radiusKm =
        dto.radiusKm ?? 10;

      const radiusMeters =
        radiusKm * 1000;

      query.andWhere(
        `
        ST_DWithin(
          place.location,
          ST_SetSRID(
            ST_MakePoint(
              :longitude,
              :latitude
            ),
            4326
          )::geography,
          :radiusMeters
        )
        `,
        {
          latitude:
            dto.latitude,
          longitude:
            dto.longitude,
          radiusMeters,
        },
      );

      query.addSelect(
        `
        ST_Distance(
          place.location,
          ST_SetSRID(
            ST_MakePoint(
              :longitude,
              :latitude
            ),
            4326
          )::geography
        )
        `,
        'distance',
      );

      query.orderBy(
        'distance',
        'ASC',
      );
    } else {
      query.orderBy(
        'place.createdAt',
        'DESC',
      );
    }

    query
      .skip(
        (page - 1) * limit,
      )
      .take(limit);

    const [items, total] =
      await query.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages:
        Math.ceil(
          total / limit,
        ),
    };
  }

  async findOne(
    id: string,
  ): Promise<Place> {
    const place =
      await this.placesRepository.findOneBy(
        {
          id,
        },
      );

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
    const place =
      await this.findOne(id);

    this.checkOwnership(
      place,
      userId,
    );

    if (
      dto.name !== undefined ||
      dto.address !== undefined ||
      dto.city !== undefined ||
      dto.country !== undefined
    ) {
      const name =
        dto.name?.trim() ??
        place.name;

      const address =
        dto.address?.trim() ??
        place.address;

      const city =
        dto.city?.trim() ??
        place.city;

      const country =
        dto.country?.trim() ??
        place.country;

      const duplicate =
        await this.placesRepository
          .createQueryBuilder('other')
          .where(
            'other.id != :id',
            {
              id,
            },
          )
          .andWhere(
            'LOWER(other.name) = LOWER(:name)',
            {
              name,
            },
          )
          .andWhere(
            'LOWER(other.address) = LOWER(:address)',
            {
              address,
            },
          )
          .andWhere(
            'LOWER(other.city) = LOWER(:city)',
            {
              city,
            },
          )
          .andWhere(
            'LOWER(other.country) = LOWER(:country)',
            {
              country,
            },
          )
          .getOne();

      if (duplicate) {
        throw new ConflictException(
          'Ce lieu existe déjà.',
        );
      }
    }

    if (dto.name !== undefined) {
      place.name =
        dto.name.trim();
    }

    if (
      dto.address !== undefined
    ) {
      place.address =
        dto.address.trim();
    }

    if (dto.city !== undefined) {
      place.city =
        dto.city.trim();
    }

    if (
      dto.country !== undefined
    ) {
      place.country =
        dto.country.trim();
    }

    if (
      dto.category !== undefined
    ) {
      place.category =
        dto.category.trim();
    }

    if (
      dto.description !==
      undefined
    ) {
      place.description =
        dto.description.trim();
    }

    if (
      dto.openingHours !==
      undefined
    ) {
      place.openingHours =
        dto.openingHours;
    }

    if (
      dto.priceLevel !==
      undefined
    ) {
      place.priceLevel =
        dto.priceLevel;
    }

    if (dto.tags !== undefined) {
      place.tags =
        dto.tags.map(
          (tag) =>
            tag
              .trim()
              .toLowerCase(),
        );
    }

    if (
      dto.latitude !==
        undefined ||
      dto.longitude !==
        undefined
    ) {
      const currentLongitude =
        place.location
          .coordinates[0];

      const currentLatitude =
        place.location
          .coordinates[1];

      place.location = {
        type: 'Point',
        coordinates: [
          dto.longitude ??
            currentLongitude,
          dto.latitude ??
            currentLatitude,
        ],
      };
    }

    return this.placesRepository.save(
      place,
    );
  }

  async remove(
    id: string,
    userId: string,
  ): Promise<void> {
    const place =
      await this.findOne(id);

    this.checkOwnership(
      place,
      userId,
    );

    await this.placesRepository.remove(
      place,
    );
  }

  private checkOwnership(
    place: Place,
    userId: string,
  ): void {
    if (
      place.createdById !==
      userId
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à modifier ou supprimer ce lieu.",
      );
    }
  }
}