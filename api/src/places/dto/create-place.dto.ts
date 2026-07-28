import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreatePlaceDto {
  @ApiProperty({
    example: 'Musée du Louvre',
    maxLength: 160,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @ApiProperty({
    example: 'Rue de Rivoli, 75001 Paris',
    maxLength: 500,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  address!: string;

  @ApiProperty({
    example: 'Paris',
    maxLength: 120,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  city!: string;

  @ApiProperty({
    example: 'France',
    maxLength: 120,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  country!: string;

  @ApiProperty({
    example: 'Musée',
    maxLength: 80,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  category!: string;

  @ApiProperty({
    example:
      "L'un des plus grands musées d'art au monde.",
  })
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @ApiPropertyOptional({
    example: {
      monday: '09:00-18:00',
      tuesday: 'Fermé',
    },
  })
  @IsOptional()
  @IsObject()
  openingHours?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: 2,
    minimum: 1,
    maximum: 4,
    description:
      '1 = économique, 4 = très élevé',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(4)
  priceLevel?: number;

  @ApiPropertyOptional({
    example: ['art', 'culture', 'histoire'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @IsString({ each: true })
  @MaxLength(40, { each: true })
  tags?: string[];

  @ApiProperty({
    example: 48.8606,
    minimum: -90,
    maximum: 90,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({
    example: 2.3376,
    minimum: -180,
    maximum: 180,
  })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude!: number;
}