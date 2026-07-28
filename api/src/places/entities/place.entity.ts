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
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../users/entities/user.entity';

export interface GeoPoint {
  type: 'Point';

  // L’ordre GeoJSON est longitude, puis latitude.
  coordinates: [number, number];
}

@Entity({ name: 'places' })
@Index('IDX_places_name', ['name'])
@Index('IDX_places_city', ['city'])
@Index('IDX_places_category', ['category'])
@Check(
  'CHK_places_price_level',
  '"price_level" IS NULL OR "price_level" BETWEEN 1 AND 4',
)
@Check(
  'CHK_places_rating_average',
  '"rating_average" BETWEEN 0 AND 5',
)
export class Place {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'created_by_id',
    type: 'uuid',
  })
  createdById!: string;

  @ManyToOne(
    () => User,
    {
      nullable: false,
      onDelete: 'RESTRICT',
    },
  )
  @JoinColumn({
    name: 'created_by_id',
  })
  createdBy!: Relation<User>;

  @Column({
    type: 'varchar',
    length: 160,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 500,
  })
  address!: string;

  @Column({
    type: 'varchar',
    length: 120,
  })
  city!: string;

  @Column({
    type: 'varchar',
    length: 120,
  })
  country!: string;

  @Column({
    type: 'varchar',
    length: 80,
  })
  category!: string;

  @Column({
    type: 'text',
  })
  description!: string;

  @Column({
    name: 'opening_hours',
    type: 'jsonb',
    nullable: true,
  })
  openingHours!: Record<string, unknown> | null;

  /**
   * Fourchette indicative :
   * 1 = économique
   * 2 = modéré
   * 3 = élevé
   * 4 = très élevé
   */
  @Column({
    name: 'price_level',
    type: 'smallint',
    nullable: true,
  })
  priceLevel!: number | null;

  @Column({
    type: 'text',
    array: true,
    default: () => 'ARRAY[]::text[]',
  })
  tags!: string[];

  @Column({
    name: 'rating_average',
    type: 'double precision',
    default: 0,
  })
  ratingAverage!: number;

  @Column({
    name: 'review_count',
    type: 'integer',
    default: 0,
  })
  reviewCount!: number;

  @Index({
    spatial: true,
  })
  @Column({
    type: 'geography',
    spatialFeatureType: 'Point',
    srid: 4326,
  })
  location!: GeoPoint;

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