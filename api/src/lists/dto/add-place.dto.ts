import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class AddPlaceDto {
  @ApiProperty({
    example: '9c4d34af-40e8-46aa-8410-65703841ee78',
  })
  @IsUUID()
  placeId!: string;
}