import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';

import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './entities/user.entity';

interface CreateLocalUserData {
  email: string;
  displayName: string;
  passwordHash: string;
}

interface GoogleUserData {
  subject: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
}

export interface UserSettings {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  travelPreferences: Record<
    string,
    unknown
  >;
  hasPassword: boolean;
  oauthProvider: string | null;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createLocalUser(
    data: CreateLocalUserData,
  ): Promise<User> {
    const user =
      this.usersRepository.create({
        email:
          data.email
            .trim()
            .toLowerCase(),
        displayName:
          data.displayName.trim(),
        passwordHash:
          data.passwordHash,
        avatarUrl: null,
        oauthProvider: null,
        oauthSubject: null,
        travelPreferences: {},
        isActive: true,
      });

    try {
      return await this.usersRepository.save(
        user,
      );
    } catch (error: unknown) {
      if (
        this.isUniqueConstraintViolation(
          error,
        )
      ) {
        throw new ConflictException(
          'Cette adresse e-mail est déjà utilisée.',
        );
      }

      throw error;
    }
  }

  async findOrCreateGoogleUser(
    data: GoogleUserData,
  ): Promise<User> {
    const email =
      data.email
        .trim()
        .toLowerCase();

    const googleUser =
      await this.usersRepository.findOne({
        where: {
          oauthProvider: 'google',
          oauthSubject: data.subject,
        },
      });

    if (googleUser) {
      return googleUser;
    }

    const existingUser =
      await this.usersRepository.findOne({
        where: {
          email,
        },
      });

    if (existingUser) {
      existingUser.oauthProvider =
        'google';
      existingUser.oauthSubject =
        data.subject;

      if (
        !existingUser.avatarUrl &&
        data.avatarUrl
      ) {
        existingUser.avatarUrl =
          data.avatarUrl;
      }

      if (
        !existingUser.emailVerifiedAt
      ) {
        existingUser.emailVerifiedAt =
          new Date();
      }

      return this.usersRepository.save(
        existingUser,
      );
    }

    const user =
      this.usersRepository.create({
        email,
        displayName:
          data.displayName.trim(),
        passwordHash: null,
        avatarUrl: data.avatarUrl,
        oauthProvider: 'google',
        oauthSubject:
          data.subject,
        travelPreferences: {},
        isActive: true,
        emailVerifiedAt:
          new Date(),
      });

    try {
      return await this.usersRepository.save(
        user,
      );
    } catch (error: unknown) {
      if (
        this.isUniqueConstraintViolation(
          error,
        )
      ) {
        throw new ConflictException(
          'Cette adresse e-mail est déjà utilisée.',
        );
      }

      throw error;
    }
  }

  async findByEmail(
    email: string,
  ): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .where(
        'LOWER(user.email) = LOWER(:email)',
        {
          email: email.trim(),
        },
      )
      .getOne();
  }

  async findByEmailForAuthentication(
    email: string,
  ): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect(
        'user.passwordHash',
      )
      .where(
        'LOWER(user.email) = LOWER(:email)',
        {
          email: email.trim(),
        },
      )
      .getOne();
  }

  async findById(
    id: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        id,
        isActive: true,
      },
    });
  }

  async getSettings(
    userId: string,
  ): Promise<UserSettings> {
    const user =
      await this.usersRepository
        .createQueryBuilder('user')
        .addSelect(
          'user.passwordHash',
        )
        .where(
          'user.id = :userId',
          {
            userId,
          },
        )
        .andWhere(
          'user.isActive = true',
        )
        .getOne();

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable.',
      );
    }

    return {
      id: user.id,
      email: user.email,
      displayName:
        user.displayName,
      avatarUrl:
        user.avatarUrl,
      travelPreferences:
        user.travelPreferences,
      hasPassword:
        Boolean(
          user.passwordHash,
        ),
      oauthProvider:
        user.oauthProvider,
    };
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ): Promise<User> {
    const user =
      await this.findById(userId);

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable.',
      );
    }

    if (
      dto.displayName !==
      undefined
    ) {
      user.displayName =
        dto.displayName.trim();
    }

    if (
      dto.travelPreferences !==
      undefined
    ) {
      user.travelPreferences =
        dto.travelPreferences;
    }

    return this.usersRepository.save(
      user,
    );
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ): Promise<void> {
    const user =
      await this.usersRepository
        .createQueryBuilder('user')
        .addSelect(
          'user.passwordHash',
        )
        .where(
          'user.id = :userId',
          {
            userId,
          },
        )
        .andWhere(
          'user.isActive = true',
        )
        .getOne();

    if (!user) {
      throw new NotFoundException(
        'Utilisateur introuvable.',
      );
    }

    if (!user.passwordHash) {
      throw new UnauthorizedException(
        'Ce compte ne possède pas de mot de passe local.',
      );
    }

    const validPassword =
      await argon2.verify(
        user.passwordHash,
        dto.currentPassword,
      );

    if (!validPassword) {
      throw new UnauthorizedException(
        'Mot de passe actuel incorrect.',
      );
    }

    user.passwordHash =
      await argon2.hash(
        dto.newPassword,
      );

    await this.usersRepository.save(
      user,
    );
  }

  private isUniqueConstraintViolation(
    error: unknown,
  ): boolean {
    if (
      typeof error !== 'object' ||
      error === null
    ) {
      return false;
    }

    const possibleError =
      error as {
        driverError?: {
          code?: string;
        };
      };

    return (
      possibleError
        .driverError
        ?.code === '23505'
    );
  }
}