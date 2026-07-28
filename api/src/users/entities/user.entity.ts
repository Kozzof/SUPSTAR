import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'users' })
@Index(
  'UQ_users_oauth_identity',
  ['oauthProvider', 'oauthSubject'],
  {
    unique: true,
  },
)
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 254,
    unique: true,
  })
  email!: string;

  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  passwordHash!: string | null;

  @Column({
    name: 'display_name',
    type: 'varchar',
    length: 80,
  })
  displayName!: string;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: 2048,
    nullable: true,
  })
  avatarUrl!: string | null;

  @Column({
    name: 'oauth_provider',
    type: 'varchar',
    length: 32,
    nullable: true,
  })
  oauthProvider!: string | null;

  @Column({
    name: 'oauth_subject',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  oauthSubject!: string | null;

  @Column({
    name: 'travel_preferences',
    type: 'jsonb',
    default: () => "'{}'::jsonb",
  })
  travelPreferences!: Record<string, unknown>;

  @Column({
    name: 'is_active',
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @Column({
    name: 'email_verified_at',
    type: 'timestamp with time zone',
    nullable: true,
  })
  emailVerifiedAt!: Date | null;

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