import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreatePlacePhotoDto {
  @ApiProperty({
    example:
      'https://example.com/photo.jpg',
  })
  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(2048)
  url!: string;

  @ApiPropertyOptional({
    example: 'Terrasse du restaurant',
  })
  @IsOptional()
  @IsString()
  @MaxLength(300)
  caption?: string;

  @ApiPropertyOptional({
    example: 0,
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  displayOrder?: number;
}