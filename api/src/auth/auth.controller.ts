import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { User } from '../users/entities/user.entity';
import {
  AuthService,
  type AuthResponse,
  type PublicUser,
} from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: User;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Créer un compte utilisateur',
  })
  @ApiCreatedResponse({
    description:
      'Le compte a été créé et un jeton JWT a été généré.',
  })
  @ApiConflictResponse({
    description:
      'Un compte existe déjà avec cette adresse e-mail.',
  })
  register(
    @Body() dto: RegisterDto,
  ): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Se connecter avec un compte local',
  })
  @ApiOkResponse({
    description:
      'Connexion réussie et jeton JWT généré.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Adresse e-mail ou mot de passe incorrect.',
  })
  login(
    @Body() dto: LoginDto,
  ): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Récupérer l'utilisateur connecté",
  })
  @ApiOkResponse({
    description:
      "Informations de l'utilisateur connecté.",
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  getCurrentUser(
    @Req() request: AuthenticatedRequest,
  ): PublicUser {
    return this.authService.getCurrentUser(
      request.user,
    );
  }
}