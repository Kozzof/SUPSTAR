import {
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { GoogleProfileData } from './strategies/google.strategy';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  travelPreferences: Record<string, unknown>;
  isActive: boolean;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: PublicUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    dto: RegisterDto,
  ): Promise<AuthResponse> {
    const passwordHash = await argon2.hash(
      dto.password,
    );

    const user =
      await this.usersService.createLocalUser({
        email: dto.email,
        displayName: dto.displayName,
        passwordHash,
      });

    return this.createAuthResponse(user);
  }

  async login(
    dto: LoginDto,
  ): Promise<AuthResponse> {
    const user =
      await this.usersService.findByEmailForAuthentication(
        dto.email,
      );

    if (
      !user ||
      !user.isActive ||
      !user.passwordHash
    ) {
      throw new UnauthorizedException(
        'Adresse e-mail ou mot de passe incorrect.',
      );
    }

    const passwordIsValid = await argon2.verify(
      user.passwordHash,
      dto.password,
    );

    if (!passwordIsValid) {
      throw new UnauthorizedException(
        'Adresse e-mail ou mot de passe incorrect.',
      );
    }

    return this.createAuthResponse(user);
  }

  async loginWithGoogle(
    profile: GoogleProfileData,
  ): Promise<AuthResponse> {
    const user =
      await this.usersService.findOrCreateGoogleUser({
        subject: profile.subject,
        email: profile.email,
        displayName: profile.displayName,
        avatarUrl: profile.avatarUrl,
      });

    if (!user.isActive) {
      throw new UnauthorizedException(
        'Ce compte utilisateur est désactivé.',
      );
    }

    return this.createAuthResponse(user);
  }

  getCurrentUser(
    user: User,
  ): PublicUser {
    return this.toPublicUser(user);
  }

  private async createAuthResponse(
    user: User,
  ): Promise<AuthResponse> {
    const accessToken =
      await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      });

    return {
      accessToken,
      user: this.toPublicUser(user),
    };
  }

  private toPublicUser(
    user: User,
  ): PublicUser {
    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      travelPreferences: user.travelPreferences,
      isActive: user.isActive,
      emailVerifiedAt: user.emailVerifiedAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}