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
import { AddMemberDto } from './dto/add-member.dto';
import { AddPlaceDto } from './dto/add-place.dto';
import { CreateListCommentDto } from './dto/create-list-comment.dto';
import { CreateListDto } from './dto/create-list.dto';
import { SearchListPlacesDto } from './dto/search-list-places.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ListsService } from './lists.service';

interface AuthenticatedRequest
  extends Request {
  user: User;
}

@ApiTags('Lists')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('lists')
export class ListsController {
  constructor(
    private readonly listsService: ListsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Créer une liste',
  })
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateListDto,
  ) {
    return this.listsService.create(
      request.user.id,
      dto,
    );
  }

  @Get()
  @ApiOperation({
    summary: 'Afficher mes listes',
  })
  findAll(
    @Req() request: AuthenticatedRequest,
  ) {
    return this.listsService.findAllForUser(
      request.user.id,
    );
  }

  @Get(':listId/places')
  @ApiOperation({
    summary:
      'Rechercher les lieux présents dans une liste',
  })
  searchPlaces(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
    @Query() dto: SearchListPlacesDto,
  ) {
    return this.listsService.searchPlaces(
      request.user.id,
      listId,
      dto,
    );
  }

  @Get(':listId/comments')
  @ApiOperation({
    summary:
      'Afficher les commentaires d’une liste',
  })
  findComments(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.listsService.findComments(
      request.user.id,
      listId,
    );
  }

  @Post(':listId/comments')
  @ApiOperation({
    summary:
      'Ajouter un commentaire à une liste',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'a pas la permission de commenter.",
  })
  addComment(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    dto: CreateListCommentDto,
  ) {
    return this.listsService.addComment(
      request.user.id,
      listId,
      dto,
    );
  }

  @Delete(
    ':listId/comments/:commentId',
  )
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @ApiOperation({
    summary:
      'Supprimer un commentaire',
  })
  @ApiNoContentResponse({
    description:
      'Commentaire supprimé.',
  })
  removeComment(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Param(
      'commentId',
      new ParseUUIDPipe(),
    )
    commentId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.listsService.removeComment(
      request.user.id,
      listId,
      commentId,
    );
  }

  @Get(':listId')
  @ApiOperation({
    summary: 'Afficher une liste',
  })
  @ApiForbiddenResponse({
    description:
      "L'utilisateur n'est pas membre de la liste.",
  })
  @ApiNotFoundResponse({
    description:
      'Liste introuvable.',
  })
  findOne(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.listsService.findOne(
      request.user.id,
      listId,
    );
  }

  @Patch(':listId')
  @ApiOperation({
    summary: 'Modifier une liste',
  })
  update(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateListDto,
  ) {
    return this.listsService.update(
      request.user.id,
      listId,
      dto,
    );
  }

  @Delete(':listId')
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @ApiOperation({
    summary: 'Supprimer une liste',
  })
  @ApiNoContentResponse({
    description:
      'Liste supprimée.',
  })
  remove(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.listsService.remove(
      request.user.id,
      listId,
    );
  }

  @Post(':listId/members')
  @ApiOperation({
    summary:
      'Ajouter un membre à une liste',
  })
  @ApiConflictResponse({
    description:
      "L'utilisateur est déjà membre.",
  })
  addMember(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: AddMemberDto,
  ) {
    return this.listsService.addMember(
      request.user.id,
      listId,
      dto,
    );
  }

  @Patch(
    ':listId/members/:memberId',
  )
  @ApiOperation({
    summary:
      'Modifier le rôle d’un membre',
  })
  updateMemberRole(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Param(
      'memberId',
      new ParseUUIDPipe(),
    )
    memberId: string,
    @Req() request: AuthenticatedRequest,
    @Body()
    dto: UpdateMemberRoleDto,
  ) {
    return this.listsService.updateMemberRole(
      request.user.id,
      listId,
      memberId,
      dto,
    );
  }

  @Delete(
    ':listId/members/:memberId',
  )
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @ApiOperation({
    summary:
      'Retirer un membre d’une liste',
  })
  removeMember(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Param(
      'memberId',
      new ParseUUIDPipe(),
    )
    memberId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.listsService.removeMember(
      request.user.id,
      listId,
      memberId,
    );
  }

  @Post(':listId/places')
  @ApiOperation({
    summary:
      'Ajouter un lieu à une liste',
  })
  addPlace(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Req() request: AuthenticatedRequest,
    @Body() dto: AddPlaceDto,
  ) {
    return this.listsService.addPlace(
      request.user.id,
      listId,
      dto,
    );
  }

  @Delete(
    ':listId/places/:placeId',
  )
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @ApiOperation({
    summary:
      'Retirer un lieu d’une liste',
  })
  removePlace(
    @Param(
      'listId',
      new ParseUUIDPipe(),
    )
    listId: string,
    @Param(
      'placeId',
      new ParseUUIDPipe(),
    )
    placeId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.listsService.removePlace(
      request.user.id,
      listId,
      placeId,
    );
  }
}