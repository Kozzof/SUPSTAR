import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsOptional,
} from 'class-validator';

export class UpdatePlaceStatusDto {
  @ApiPropertyOptional({
    example: true,
    description: 'Indique si le lieu a été visité.',
  })
  @IsOptional()
  @IsBoolean()
  visited?: boolean;

  @ApiPropertyOptional({
    example: false,
    description:
      'Indique si l’utilisateur souhaite visiter le lieu.',
  })
  @IsOptional()
  @IsBoolean()
  wantToVisit?: boolean;

  @ApiPropertyOptional({
    example: true,
    description:
      'Indique si le lieu est dans les favoris.',
  })
  @IsOptional()
  @IsBoolean()
  favorite?: boolean;
}