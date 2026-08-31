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
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { CreatePlaceDto } from './dto/create-place.dto';
import { SearchPlacesDto } from './dto/search-places.dto';
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Place } from './entities/place.entity';
import {
  PlacesService,
  SearchPlacesResult,
} from './places.service';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('Places')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('places')
export class PlacesController {
  constructor(
    private readonly placesService: PlacesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Créer un lieu',
  })
  @ApiCreatedResponse({
    description:
      'Lieu créé avec succès.',
    type: Place,
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  create(
    @Req()
    request: AuthenticatedRequest,
    @Body()
    dto: CreatePlaceDto,
  ): Promise<Place> {
    return this.placesService.create(
      request.user.id,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary:
      'Rechercher et filtrer les lieux',
  })
  @ApiOkResponse({
    description:
      'Résultats paginés de la recherche.',
  })
  search(
    @Req()
    request: AuthenticatedRequest,
    @Query()
    dto: SearchPlacesDto,
  ): Promise<SearchPlacesResult> {
    return this.placesService.search(
      request.user.id,
      dto,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Afficher un lieu',
  })
  @ApiOkResponse({
    type: Place,
  })
  @ApiNotFoundResponse({
    description:
      'Lieu introuvable.',
  })
  findOne(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
  ): Promise<Place> {
    return this.placesService.findOne(
      id,
    );
  }

  @Patch(':id')
  @ApiOperation({
    summary:
      'Modifier un lieu créé par l’utilisateur',
  })
  @ApiOkResponse({
    description:
      'Lieu modifié avec succès.',
    type: Place,
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'est pas le créateur du lieu.",
  })
  @ApiNotFoundResponse({
    description:
      'Lieu introuvable.',
  })
  update(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
    @Req()
    request: AuthenticatedRequest,
    @Body()
    dto: UpdatePlaceDto,
  ): Promise<Place> {
    return this.placesService.update(
      id,
      request.user.id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @ApiOperation({
    summary:
      'Supprimer un lieu créé par l’utilisateur',
  })
  @ApiNoContentResponse({
    description:
      'Lieu supprimé avec succès.',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'est pas le créateur du lieu.",
  })
  @ApiNotFoundResponse({
    description:
      'Lieu introuvable.',
  })
  remove(
    @Param(
      'id',
      new ParseUUIDPipe(),
    )
    id: string,
    @Req()
    request: AuthenticatedRequest,
  ): Promise<void> {
    return this.placesService.remove(
      id,
      request.user.id,
    );
  }
}