import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import { Repository } from 'typeorm';

import { CreatePlaceDto } from '../places/dto/create-place.dto';
import { Place } from '../places/entities/place.entity';
import { PlacesService } from '../places/places.service';
import { ImportPlacesDto } from './dto/import-places.dto';

interface ExportedPlace {
  name: string;
  address: string;
  city: string;
  country: string;
  category: string;
  description: string;
  openingHours: Record<string, unknown> | null;
  priceLevel: number | null;
  tags: string[];
  ratingAverage: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
}

interface ExportResult {
  content: string;
  contentType: string;
  fileName: string;
}

export interface ImportResult {
  imported: number;
  failed: number;
  errors: Array<{
    row: number;
    message: string;
  }>;
}

@Injectable()
export class DataTransferService {
  constructor(
    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,

    private readonly placesService: PlacesService,
  ) {}

  async exportPlaces(
    format: 'json' | 'csv',
  ): Promise<ExportResult> {
    const places =
      await this.placesRepository.find({
        order: {
          createdAt: 'ASC',
        },
      });

    const data = places.map(
      (place): ExportedPlace => ({
        name: place.name,
        address: place.address,
        city: place.city,
        country: place.country,
        category: place.category,
        description: place.description,
        openingHours: place.openingHours,
        priceLevel: place.priceLevel,
        tags: place.tags,
        ratingAverage: place.ratingAverage,
        reviewCount: place.reviewCount,
        longitude: place.location.coordinates[0],
        latitude: place.location.coordinates[1],
      }),
    );

    if (format === 'csv') {
      const content = stringify(
        data.map((place) => ({
          ...place,
          openingHours: place.openingHours
            ? JSON.stringify(place.openingHours)
            : '',
          tags: JSON.stringify(place.tags),
        })),
        {
          header: true,
          columns: [
            'name',
            'address',
            'city',
            'country',
            'category',
            'description',
            'openingHours',
            'priceLevel',
            'tags',
            'ratingAverage',
            'reviewCount',
            'latitude',
            'longitude',
          ],
        },
      );

      return {
        content,
        contentType:
          'text/csv; charset=utf-8',
        fileName:
          'supstar-places.csv',
      };
    }

    return {
      content: JSON.stringify(
        data,
        null,
        2,
      ),
      contentType:
        'application/json; charset=utf-8',
      fileName:
        'supstar-places.json',
    };
  }

  async importPlaces(
    userId: string,
    dto: ImportPlacesDto,
  ): Promise<ImportResult> {
    let rows: unknown[];

    if (dto.format === 'json') {
      rows = this.parseJson(
        dto.data,
      );
    } else {
      rows = this.parseCsv(
        dto.data,
      );
    }

    const result: ImportResult = {
      imported: 0,
      failed: 0,
      errors: [],
    };

    for (
      let index = 0;
      index < rows.length;
      index += 1
    ) {
      try {
        const normalized =
          this.normalizeRow(
            rows[index],
            dto.format,
          );

        const placeDto =
          plainToInstance(
            CreatePlaceDto,
            normalized,
          );

        const validationErrors =
          await validate(placeDto, {
            whitelist: true,
            forbidNonWhitelisted: true,
          });

        if (
          validationErrors.length > 0
        ) {
          throw new Error(
            'Données du lieu invalides.',
          );
        }

        await this.placesService.create(
          userId,
          placeDto,
        );

        result.imported += 1;
      } catch (error: unknown) {
        result.failed += 1;

        result.errors.push({
          row: index + 1,
          message:
            error instanceof Error
              ? error.message
              : 'Erreur inconnue.',
        });
      }
    }

    return result;
  }

  private parseJson(
    content: string,
  ): unknown[] {
    try {
      const parsed: unknown =
        JSON.parse(content);

      if (!Array.isArray(parsed)) {
        throw new Error();
      }

      return parsed;
    } catch {
      throw new BadRequestException(
        'Le contenu JSON doit être un tableau de lieux valide.',
      );
    }
  }

  private parseCsv(
    content: string,
  ): unknown[] {
    try {
      return parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      }) as unknown[];
    } catch {
      throw new BadRequestException(
        'Le contenu CSV est invalide.',
      );
    }
  }

  private normalizeRow(
    value: unknown,
    format: 'json' | 'csv',
  ): Record<string, unknown> {
    if (
      !value ||
      typeof value !== 'object' ||
      Array.isArray(value)
    ) {
      throw new Error(
        'Le lieu doit être un objet.',
      );
    }

    const row = value as Record<
      string,
      unknown
    >;

    if (format === 'json') {
      return {
        name: row.name,
        address: row.address,
        city: row.city,
        country: row.country,
        category: row.category,
        description: row.description,
        openingHours:
          row.openingHours ??
          undefined,
        priceLevel:
          row.priceLevel ??
          undefined,
        tags:
          row.tags ?? [],
        latitude:
          row.latitude,
        longitude:
          row.longitude,
      };
    }

    return {
      name: row.name,
      address: row.address,
      city: row.city,
      country: row.country,
      category: row.category,
      description: row.description,

      openingHours:
        this.parseJsonField(
          row.openingHours,
          undefined,
        ),

      priceLevel:
        this.parseOptionalNumber(
          row.priceLevel,
        ),

      tags:
        this.parseJsonField(
          row.tags,
          [],
        ),

      latitude:
        this.parseRequiredNumber(
          row.latitude,
          'latitude',
        ),

      longitude:
        this.parseRequiredNumber(
          row.longitude,
          'longitude',
        ),
    };
  }

  private parseOptionalNumber(
    value: unknown,
  ): number | undefined {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return undefined;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      throw new Error(
        'Valeur numérique invalide.',
      );
    }

    return number;
  }

  private parseRequiredNumber(
    value: unknown,
    field: string,
  ): number {
    const number = Number(value);

    if (
      value === undefined ||
      value === null ||
      value === '' ||
      Number.isNaN(number)
    ) {
      throw new Error(
        `Valeur ${field} invalide.`,
      );
    }

    return number;
  }

  private parseJsonField<T>(
    value: unknown,
    fallback: T,
  ): T {
    if (
      value === undefined ||
      value === null ||
      value === ''
    ) {
      return fallback;
    }

    if (
      typeof value !== 'string'
    ) {
      return value as T;
    }

    try {
      return JSON.parse(
        value,
      ) as T;
    } catch {
      throw new Error(
        'Champ JSON invalide.',
      );
    }
  }
}