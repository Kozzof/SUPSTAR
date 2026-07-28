import {
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  QueryFailedError,
  Repository,
} from 'typeorm';

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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createLocalUser(
    data: CreateLocalUserData,
  ): Promise<User> {
    const user = this.usersRepository.create({
      email: data.email.toLowerCase(),
      displayName: data.displayName,
      passwordHash: data.passwordHash,
      avatarUrl: null,
      oauthProvider: null,
      oauthSubject: null,
      travelPreferences: {},
      isActive: true,
      emailVerifiedAt: null,
    });

    try {
      return await this.usersRepository.save(user);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        this.isUniqueConstraintViolation(error)
      ) {
        throw new ConflictException(
          'Un compte existe déjà avec cette adresse e-mail.',
        );
      }

      throw error;
    }
  }

  async findOrCreateGoogleUser(
    data: GoogleUserData,
  ): Promise<User> {
    const normalizedEmail = data.email.toLowerCase();

    const userByGoogleIdentity =
      await this.usersRepository.findOne({
        where: {
          oauthProvider: 'google',
          oauthSubject: data.subject,
        },
      });

    if (userByGoogleIdentity) {
      return userByGoogleIdentity;
    }

    const userByEmail = await this.usersRepository.findOne({
      where: {
        email: normalizedEmail,
      },
    });

    if (userByEmail) {
      if (
        userByEmail.oauthProvider &&
        userByEmail.oauthProvider !== 'google'
      ) {
        throw new ConflictException(
          'Ce compte est déjà associé à un autre fournisseur OAuth.',
        );
      }

      userByEmail.oauthProvider = 'google';
      userByEmail.oauthSubject = data.subject;
      userByEmail.avatarUrl =
        userByEmail.avatarUrl ?? data.avatarUrl;
      userByEmail.emailVerifiedAt =
        userByEmail.emailVerifiedAt ?? new Date();

      return this.usersRepository.save(userByEmail);
    }

    const newUser = this.usersRepository.create({
      email: normalizedEmail,
      displayName: data.displayName,
      passwordHash: null,
      avatarUrl: data.avatarUrl,
      oauthProvider: 'google',
      oauthSubject: data.subject,
      travelPreferences: {},
      isActive: true,
      emailVerifiedAt: new Date(),
    });

    try {
      return await this.usersRepository.save(newUser);
    } catch (error: unknown) {
      if (
        error instanceof QueryFailedError &&
        this.isUniqueConstraintViolation(error)
      ) {
        throw new ConflictException(
          'Cette identité Google est déjà utilisée.',
        );
      }

      throw error;
    }
  }

  async findByEmail(
    email: string,
  ): Promise<User | null> {
    return this.usersRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  async findByEmailForAuthentication(
    email: string,
  ): Promise<User | null> {
    return this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('LOWER(user.email) = LOWER(:email)', {
        email,
      })
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

  private isUniqueConstraintViolation(
    error: QueryFailedError,
  ): boolean {
    const driverError = error.driverError as {
      code?: string;
    };

    return driverError.code === '23505';
  }
}