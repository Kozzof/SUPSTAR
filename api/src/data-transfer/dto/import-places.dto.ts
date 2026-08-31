import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsString,
  MaxLength,
} from 'class-validator';

export class ImportPlacesDto {
  @ApiProperty({
    enum: ['json', 'csv'],
    example: 'json',
  })
  @IsIn(['json', 'csv'])
  format!: 'json' | 'csv';

  @ApiProperty({
    description:
      'Contenu du fichier JSON ou CSV à importer.',
  })
  @IsString()
  @MaxLength(10_000_000)
  data!: string;
}