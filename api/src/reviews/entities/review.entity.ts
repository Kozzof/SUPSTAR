import {
  Check,
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

@Entity({ name: 'reviews' })
@Unique('UQ_reviews_user_place', ['userId', 'placeId'])
@Index('IDX_reviews_place_id', ['placeId'])
@Index('IDX_reviews_user_id', ['userId'])
@Check('CHK_reviews_rating', '"rating" BETWEEN 1 AND 5')
export class Review {
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
    type: 'smallint',
  })
  rating!: number;

  @Column({
    type: 'text',
  })
  comment!: string;

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