import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateListCommentDto {
  @ApiProperty({
    example:
      'On pourrait tester ce restaurant samedi.',
  })
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  comment!: string;
}