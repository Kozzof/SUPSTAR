import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsIn,
} from 'class-validator';

import { ListMemberRole } from '../entities/list-member.entity';

export class AddMemberDto {
  @ApiProperty({
    example: 'user@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    enum: [
      ListMemberRole.EDITOR,
      ListMemberRole.COMMENTER,
      ListMemberRole.READER,
    ],
    example: ListMemberRole.EDITOR,
  })
  @IsIn([
    ListMemberRole.EDITOR,
    ListMemberRole.COMMENTER,
    ListMemberRole.READER,
  ])
  role!: ListMemberRole;
}