import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SearchPlacesDto {
  @ApiPropertyOptional({
    example: 'pizza napolitaine',
    description:
      'Recherche textuelle dans le nom, la description, la ville, la catégorie et les tags.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string;

  @ApiPropertyOptional({
    example: 'Restaurant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  category?: string;

  @ApiPropertyOptional({
    example: 'Paris',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  city?: string;

  @ApiPropertyOptional({
    example: 4,
    minimum: 0,
    maximum: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(5)
  minRating?: number;

  @ApiPropertyOptional({
    example: 3,
    minimum: 1,
    maximum: 4,
    description:
      'Niveau de prix maximum accepté.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  maxPrice?: number;

  @ApiPropertyOptional({
    example: 'italien,pizza,terrasse',
    description:
      'Tags séparés par des virgules.',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  tags?: string;

  @ApiPropertyOptional({
    enum: [
      'visited',
      'wantToVisit',
      'favorite',
    ],
  })
  @IsOptional()
  @IsIn([
    'visited',
    'wantToVisit',
    'favorite',
  ])
  status?:
    | 'visited'
    | 'wantToVisit'
    | 'favorite';

  @ApiPropertyOptional({
    example: 48.8566,
    minimum: -90,
    maximum: 90,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude?: number;

  @ApiPropertyOptional({
    example: 2.3522,
    minimum: -180,
    maximum: 180,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude?: number;

  @ApiPropertyOptional({
    example: 10,
    minimum: 0.1,
    maximum: 500,
    description:
      'Rayon de recherche autour des coordonnées, en kilomètres.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.1)
  @Max(500)
  radiusKm?: number;

  @ApiPropertyOptional({
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}