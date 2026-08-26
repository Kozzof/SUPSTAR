import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  QueryFailedError,
  Repository,
} from 'typeorm';

import { Place } from '../places/entities/place.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewsRepository: Repository<Review>,

    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    placeId: string,
    dto: CreateReviewDto,
  ): Promise<Review> {
    try {
      return await this.dataSource.transaction(
        async (manager) => {
          const place = await manager.findOne(Place, {
            where: {
              id: placeId,
            },
          });

          if (!place) {
            throw new NotFoundException(
              'Lieu introuvable.',
            );
          }

          const existingReview =
            await manager.findOne(Review, {
              where: {
                userId,
                placeId,
              },
            });

          if (existingReview) {
            throw new ConflictException(
              'Vous avez déjà publié un avis pour ce lieu.',
            );
          }

          const review = manager.create(Review, {
            userId,
            placeId,
            rating: dto.rating,
            comment: dto.comment.trim(),
          });

          const savedReview = await manager.save(
            Review,
            review,
          );

          await this.recalculatePlaceRating(
            placeId,
            manager,
          );

          return savedReview;
        },
      );
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        this.isUniqueConstraintViolation(error)
      ) {
        throw new ConflictException(
          'Vous avez déjà publié un avis pour ce lieu.',
        );
      }

      throw error;
    }
  }

  async findAllForPlace(
    placeId: string,
  ): Promise<Review[]> {
    const placeExists =
      await this.placesRepository.exists({
        where: {
          id: placeId,
        },
      });

    if (!placeExists) {
      throw new NotFoundException(
        'Lieu introuvable.',
      );
    }

    return this.reviewsRepository.find({
      where: {
        placeId,
      },
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async update(
    userId: string,
    placeId: string,
    reviewId: string,
    dto: UpdateReviewDto,
  ): Promise<Review> {
    return this.dataSource.transaction(
      async (manager) => {
        const review = await manager.findOne(Review, {
          where: {
            id: reviewId,
            placeId,
          },
        });

        if (!review) {
          throw new NotFoundException(
            'Avis introuvable.',
          );
        }

        if (review.userId !== userId) {
          throw new ForbiddenException(
            "Vous n'êtes pas autorisé à modifier cet avis.",
          );
        }

        if (dto.rating !== undefined) {
          review.rating = dto.rating;
        }

        if (dto.comment !== undefined) {
          review.comment = dto.comment.trim();
        }

        const updatedReview = await manager.save(
          Review,
          review,
        );

        await this.recalculatePlaceRating(
          placeId,
          manager,
        );

        return updatedReview;
      },
    );
  }

  async remove(
    userId: string,
    placeId: string,
    reviewId: string,
  ): Promise<void> {
    await this.dataSource.transaction(
      async (manager) => {
        const review = await manager.findOne(Review, {
          where: {
            id: reviewId,
            placeId,
          },
        });

        if (!review) {
          throw new NotFoundException(
            'Avis introuvable.',
          );
        }

        if (review.userId !== userId) {
          throw new ForbiddenException(
            "Vous n'êtes pas autorisé à supprimer cet avis.",
          );
        }

        await manager.remove(Review, review);

        await this.recalculatePlaceRating(
          placeId,
          manager,
        );
      },
    );
  }

  private async recalculatePlaceRating(
    placeId: string,
    manager: EntityManager,
  ): Promise<void> {
    const result = await manager
      .createQueryBuilder(Review, 'review')
      .select(
        'COALESCE(AVG(review.rating), 0)',
        'average',
      )
      .addSelect(
        'COUNT(review.id)',
        'count',
      )
      .where(
        'review.place_id = :placeId',
        {
          placeId,
        },
      )
      .getRawOne<{
        average: string;
        count: string;
      }>();

    const ratingAverage = Number(
      result?.average ?? 0,
    );

    const reviewCount = Number(
      result?.count ?? 0,
    );

    await manager.update(
      Place,
      {
        id: placeId,
      },
      {
        ratingAverage,
        reviewCount,
      },
    );
  }

  private isUniqueConstraintViolation(
    error: QueryFailedError,
  ): boolean {
    const driverError = error.driverError as {
      code?: string;
    };

    return driverError.code === '23505';
  }
}