import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';

import { ListMemberRole } from '../entities/list-member.entity';

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: [
      ListMemberRole.EDITOR,
      ListMemberRole.COMMENTER,
      ListMemberRole.READER,
    ],
  })
  @IsIn([
    ListMemberRole.EDITOR,
    ListMemberRole.COMMENTER,
    ListMemberRole.READER,
  ])
  role!: ListMemberRole;
}