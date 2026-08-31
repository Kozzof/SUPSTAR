import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type {
  Request,
  Response,
} from 'express';

import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import type {
  AuthResponse,
  PublicUser,
} from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { GoogleProfileData } from './strategies/google.strategy';

interface JwtAuthenticatedRequest extends Request {
  user: User;
}

interface GoogleAuthenticatedRequest extends Request {
  user: GoogleProfileData;
}

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('register')
  @ApiOperation({
    summary: 'Créer un compte local',
  })
  register(
    @Body() dto: RegisterDto,
  ): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Se connecter avec e-mail et mot de passe',
  })
  @ApiOkResponse({
    description: 'Connexion réussie.',
  })
  @ApiUnauthorizedResponse({
    description: 'Identifiants invalides.',
  })
  login(
    @Body() dto: LoginDto,
  ): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Se connecter avec Google',
  })
  googleLogin(): void {
    // Passport redirige vers Google.
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback Google OAuth2',
  })
  async googleCallback(
    @Req() request: GoogleAuthenticatedRequest,
    @Res() response: Response,
  ): Promise<void> {
    const auth =
      await this.authService.loginWithGoogle(
        request.user,
      );

    const frontendUrl =
      this.configService.get<string>(
        'FRONTEND_URL',
      ) ?? 'http://localhost:5173';

    response.redirect(
      `${frontendUrl}/oauth/callback#accessToken=${encodeURIComponent(
        auth.accessToken,
      )}`,
    );
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary:
      'Afficher l’utilisateur connecté',
  })
  @ApiOkResponse({
    description: 'Utilisateur connecté.',
  })
  @ApiUnauthorizedResponse({
    description:
      'Jeton JWT absent, invalide ou expiré.',
  })
  getCurrentUser(
    @Req() request: JwtAuthenticatedRequest,
  ): PublicUser {
    return this.authService.getCurrentUser(
      request.user,
    );
  }
}