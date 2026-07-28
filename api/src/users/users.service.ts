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