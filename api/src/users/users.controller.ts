import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';
import {
  UserSettings,
  UsersService,
} from './users.service';

interface AuthenticatedRequest
  extends Request {
  user: User;
}

@ApiTags('Users')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @Get('me/settings')
  @ApiOperation({
    summary:
      'Afficher les paramètres du compte',
  })
  @ApiOkResponse({
    description:
      'Paramètres utilisateur.',
  })
  getSettings(
    @Req()
    request: AuthenticatedRequest,
  ): Promise<UserSettings> {
    return this.usersService.getSettings(
      request.user.id,
    );
  }

  @Patch('me')
  @ApiOperation({
    summary:
      'Modifier le profil et les préférences de voyage',
  })
  @ApiOkResponse({
    description:
      'Profil mis à jour.',
  })
  updateProfile(
    @Req()
    request: AuthenticatedRequest,
    @Body()
    dto: UpdateProfileDto,
  ): Promise<User> {
    return this.usersService.updateProfile(
      request.user.id,
      dto,
    );
  }

  @Patch('me/password')
  @HttpCode(
    HttpStatus.NO_CONTENT,
  )
  @ApiOperation({
    summary:
      'Modifier le mot de passe',
  })
  @ApiNoContentResponse({
    description:
      'Mot de passe modifié.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Mot de passe actuel incorrect ou compte sans mot de passe local.',
  })
  changePassword(
    @Req()
    request: AuthenticatedRequest,
    @Body()
    dto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(
      request.user.id,
      dto,
    );
  }
}