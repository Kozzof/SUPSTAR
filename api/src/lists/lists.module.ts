import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';
import { ListComment } from './entities/list-comment.entity';
import { ListMember } from './entities/list-member.entity';
import { ListPlace } from './entities/list-place.entity';
import { PlaceList } from './entities/place-list.entity';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PlaceList,
      ListMember,
      ListPlace,
      ListComment,
      User,
      Place,
    ]),
  ],
  controllers: [ListsController],
  providers: [ListsService],
  exports: [ListsService],
})
export class ListsModule {}