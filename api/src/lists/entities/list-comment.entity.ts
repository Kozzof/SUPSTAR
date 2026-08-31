import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { PlaceList } from './place-list.entity';

@Entity({
  name: 'list_comments',
})
@Index('IDX_list_comments_list_id', ['listId'])
@Index('IDX_list_comments_user_id', ['userId'])
export class ListComment {
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