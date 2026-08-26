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
  UpdateDateColumn,
} from 'typeorm';

import { Place } from '../../places/entities/place.entity';
import { User } from '../../users/entities/user.entity';

@Entity({
  name: 'place_statuses',
})
@Unique(
  'UQ_place_statuses_user_place',
  ['userId', 'placeId'],
)
@Index('IDX_place_statuses_user_id', ['userId'])
@Index('IDX_place_statuses_place_id', ['placeId'])
export class PlaceStatus {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'user_id',
    type: 'uuid',
  })
  userId!: string;

  @ManyToOne(
    () => User,
    {
      nullable: false,
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'user_id',
  })
  user!: Relation<User>;

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
    type: 'boolean',
    default: false,
  })
  visited!: boolean;

  @Column({
    name: 'want_to_visit',
    type: 'boolean',
    default: false,
  })
  wantToVisit!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  favorite!: boolean;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;
}