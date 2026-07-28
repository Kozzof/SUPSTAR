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
import { UpdatePlaceDto } from './dto/update-place.dto';
import { Place } from './entities/place.entity';
import { PlacesService } from './places.service';

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
    summary: 'Créer un nouveau lieu',
  })
  @ApiCreatedResponse({
    description:
      'Le lieu a été créé avec succès.',
    type: Place,
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreatePlaceDto,
  ): Promise<Place> {
    return this.placesService.create(
      request.user.id,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Afficher tous les lieux',
  })
  @ApiOkResponse({
    description:
      'Liste des lieux enregistrés.',
    type: [Place],
  })
  findAll(): Promise<Place[]> {
    return this.placesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary:
      'Afficher un lieu par son identifiant',
  })
  @ApiOkResponse({
    description:
      'Informations du lieu demandé.',
    type: Place,
  })
  @ApiNotFoundResponse({
    description: 'Lieu introuvable.',
  })
  findOne(
    @Param('id', new ParseUUIDPipe())
    id: string,
  ): Promise<Place> {
    return this.placesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Modifier un lieu',
  })
  @ApiOkResponse({
    description:
      'Le lieu a été modifié avec succès.',
    type: Place,
  })
  @ApiNotFoundResponse({
    description: 'Lieu introuvable.',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'est pas le créateur du lieu.",
  })
  update(
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdatePlaceDto,
  ): Promise<Place> {
    return this.placesService.update(
      id,
      request.user.id,
      dto,
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Supprimer un lieu',
  })
  @ApiNoContentResponse({
    description:
      'Le lieu a été supprimé avec succès.',
  })
  @ApiNotFoundResponse({
    description: 'Lieu introuvable.',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'est pas le créateur du lieu.",
  })
  remove(
    @Param('id', new ParseUUIDPipe())
    id: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<void> {
    return this.placesService.remove(
      id,
      request.user.id,
    );
  }
}