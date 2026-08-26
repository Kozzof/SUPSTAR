import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('Reviews')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('places/:placeId/reviews')
export class ReviewsController {
  constructor(
    private readonly reviewsService: ReviewsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Publier un avis sur un lieu',
  })
  @ApiCreatedResponse({
    description: 'Avis publié avec succès.',
    type: Review,
  })
  @ApiConflictResponse({
    description:
      'Un avis existe déjà pour cet utilisateur et ce lieu.',
  })
  @ApiNotFoundResponse({
    description: 'Lieu introuvable.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  create(
    @Param('placeId', new ParseUUIDPipe())
    placeId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.create(
      request.user.id,
      placeId,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Afficher les avis d’un lieu',
  })
  @ApiOkResponse({
    description:
      'Liste des avis du lieu.',
    type: [Review],
  })
  @ApiNotFoundResponse({
    description: 'Lieu introuvable.',
  })
  findAllForPlace(
    @Param('placeId', new ParseUUIDPipe())
    placeId: string,
  ): Promise<Review[]> {
    return this.reviewsService.findAllForPlace(
      placeId,
    );
  }

  @Patch(':reviewId')
  @ApiOperation({
    summary: 'Modifier son avis',
  })
  @ApiOkResponse({
    description:
      'Avis modifié avec succès.',
    type: Review,
  })
  @ApiNotFoundResponse({
    description: 'Avis introuvable.',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'est pas l'auteur de l'avis.",
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  update(
    @Param('placeId', new ParseUUIDPipe())
    placeId: string,
    @Param('reviewId', new ParseUUIDPipe())
    reviewId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateReviewDto,
  ): Promise<Review> {
    return this.reviewsService.update(
      request.user.id,
      placeId,
      reviewId,
      dto,
    );
  }

  @Delete(':reviewId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer son avis',
  })
  @ApiNoContentResponse({
    description:
      'Avis supprimé avec succès.',
  })
  @ApiNotFoundResponse({
    description: 'Avis introuvable.',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'est pas l'auteur de l'avis.",
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  remove(
    @Param('placeId', new ParseUUIDPipe())
    placeId: string,
    @Param('reviewId', new ParseUUIDPipe())
    reviewId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.reviewsService.remove(
      request.user.id,
      placeId,
      reviewId,
    );
  }
}