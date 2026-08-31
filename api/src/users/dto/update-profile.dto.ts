import {
  ApiPropertyOptional,
} from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    example: 'Gabriel',
  })
  @IsOptional()
  @IsString()
  @Length(2, 80)
  displayName?: string;

  @ApiPropertyOptional({
    example: {
      categories: [
        'restaurant',
        'museum',
      ],
      budget: 'medium',
    },
  })
  @IsOptional()
  @IsObject()
  travelPreferences?: Record<
    string,
    unknown
  >;
}