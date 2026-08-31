import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  Unique,
} from 'typeorm';

import { Place } from '../../places/entities/place.entity';
import { User } from '../../users/entities/user.entity';

@Entity({
  name: 'place_photos',
})
@Unique(
  'UQ_place_photos_place_url',
  ['placeId', 'url'],
)
@Index(
  'IDX_place_photos_place_id',
  ['placeId'],
)
export class PlacePhoto {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

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

  @Column({
    type: 'varchar',
    length: 2048,
  })
  url!: string;

  @Column({
    type: 'varchar',
    length: 300,
    nullable: true,
  })
  caption!: string | null;

  @Column({
    name: 'display_order',
    type: 'integer',
    default: 0,
  })
  displayOrder!: number;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;
}