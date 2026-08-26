import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { UpdatePlaceStatusDto } from './dto/update-place-status.dto';
import { PlaceStatus } from './entities/place-status.entity';
import { PlaceStatusesService } from './place-statuses.service';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('Place statuses')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('places/:placeId/status')
export class PlaceStatusesController {
  constructor(
    private readonly placeStatusesService: PlaceStatusesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Afficher mon statut personnel pour un lieu',
  })
  @ApiOkResponse({
    description:
      'Statut personnel du lieu, ou null si aucun statut n’existe.',
  })
  @ApiNotFoundResponse({
    description: 'Lieu introuvable.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  findMyStatus(
    @Param('placeId', new ParseUUIDPipe())
    placeId: string,
    @Req() request: AuthenticatedRequest,
  ): Promise<PlaceStatus | null> {
    return this.placeStatusesService.findForUserAndPlace(
      request.user.id,
      placeId,
    );
  }

  @Patch()
  @ApiOperation({
    summary: 'Créer ou modifier mon statut personnel pour un lieu',
  })
  @ApiOkResponse({
    description:
      'Statut personnel enregistré avec succès.',
    type: PlaceStatus,
  })
  @ApiNotFoundResponse({
    description: 'Lieu introuvable.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  updateMyStatus(
    @Param('placeId', new ParseUUIDPipe())
    placeId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdatePlaceStatusDto,
  ): Promise<PlaceStatus> {
    return this.placeStatusesService.update(
      request.user.id,
      placeId,
      dto,
    );
  }
}