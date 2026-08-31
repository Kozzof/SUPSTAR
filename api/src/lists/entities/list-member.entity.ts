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

import { User } from '../../users/entities/user.entity';
import { PlaceList } from './place-list.entity';

export enum ListMemberRole {
  CREATOR = 'creator',
  EDITOR = 'editor',
  COMMENTER = 'commenter',
  READER = 'reader',
}

@Entity({
  name: 'list_members',
})
@Unique(
  'UQ_list_members_list_user',
  ['listId', 'userId'],
)
@Index('IDX_list_members_list_id', ['listId'])
@Index('IDX_list_members_user_id', ['userId'])
export class ListMember {
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
    type: 'enum',
    enum: ListMemberRole,
  })
  role!: ListMemberRole;

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