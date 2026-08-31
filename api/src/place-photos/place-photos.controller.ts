import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { CreatePlacePhotoDto } from './dto/create-place-photo.dto';
import { PlacePhotosService } from './place-photos.service';

interface AuthenticatedRequest
  extends Request {
  user: User;
}

@ApiTags('Place photos')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller(
  'places/:placeId/photos',
)
export class PlacePhotosController {
  constructor(
    private readonly placePhotosService: PlacePhotosService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Afficher les photos d’un lieu',
  })
  @ApiNotFoundResponse({
    description:
      'Lieu introuvable.',
  })
  findAll(
    @Param(
      'placeId',
      new ParseUUIDPipe(),
    )
    placeId: string,
  ) {
    return this.placePhotosService.findAll(
      placeId,
    );
  }

  @Post()
  @ApiOperation({
    summary:
      'Ajouter une photo à un lieu',
  })
  @ApiConflictResponse({
    description:
      'Cette photo existe déjà pour ce lieu.',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur ne peut pas gérer ce lieu.",
  })
  @ApiNotFoundResponse({
    description:
      'Lieu introuvable.',
  })
  create(
    @Param(
      'placeId',
      new ParseUUIDPipe(),
    )
    placeId: string,
    @Req()
    request: AuthenticatedRequest,
    @Body()
    dto: CreatePlacePhotoDto,
  ) {
    return this.placePhotosService.create(
      request.user.id,
      placeId,
      dto,
    );
  }

  @Delete(':photoId')
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @ApiOperation({
    summary:
      'Supprimer une photo d’un lieu',
  })
  @ApiNoContentResponse({
    description:
      'Photo supprimée.',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur ne peut pas gérer ce lieu.",
  })
  @ApiNotFoundResponse({
    description:
      'Lieu ou photo introuvable.',
  })
  remove(
    @Param(
      'placeId',
      new ParseUUIDPipe(),
    )
    placeId: string,
    @Param(
      'photoId',
      new ParseUUIDPipe(),
    )
    photoId: string,
    @Req()
    request: AuthenticatedRequest,
  ): Promise<void> {
    return this.placePhotosService.remove(
      request.user.id,
      placeId,
      photoId,
    );
  }
}