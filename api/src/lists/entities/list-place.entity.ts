import {
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Column,
  type Relation,
  Unique,
} from 'typeorm';

import { Place } from '../../places/entities/place.entity';
import { User } from '../../users/entities/user.entity';
import { PlaceList } from './place-list.entity';

@Entity({
  name: 'list_places',
})
@Unique(
  'UQ_list_places_list_place',
  ['listId', 'placeId'],
)
@Index('IDX_list_places_list_id', ['listId'])
@Index('IDX_list_places_place_id', ['placeId'])
export class ListPlace {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'list_id',
    type: 'uuid',
  })
  listId!: string;

  @ManyToOne(
    () => PlaceList,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'list_id',
  })
  list!: Relation<PlaceList>;

  @Column({
    name: 'place_id',
    type: 'uuid',
  })
  placeId!: string;

  @ManyToOne(
    () => Place,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'place_id',
  })
  place!: Relation<Place>;

  @Column({
    name: 'added_by_id',
    type: 'uuid',
    nullable: true,
  })
  addedById!: string | null;

  @ManyToOne(
    () => User,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'added_by_id',
  })
  addedBy!: Relation<User> | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;
}