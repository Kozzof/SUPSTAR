import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  Repository,
} from 'typeorm';

import { Place } from '../places/entities/place.entity';
import { User } from '../users/entities/user.entity';
import { AddMemberDto } from './dto/add-member.dto';
import { AddPlaceDto } from './dto/add-place.dto';
import { CreateListCommentDto } from './dto/create-list-comment.dto';
import { CreateListDto } from './dto/create-list.dto';
import { SearchListPlacesDto } from './dto/search-list-places.dto';
import { UpdateListDto } from './dto/update-list.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';
import { ListComment } from './entities/list-comment.entity';
import {
  ListMember,
  ListMemberRole,
} from './entities/list-member.entity';
import { ListPlace } from './entities/list-place.entity';
import { PlaceList } from './entities/place-list.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(PlaceList)
    private readonly listsRepository: Repository<PlaceList>,

    @InjectRepository(ListMember)
    private readonly membersRepository: Repository<ListMember>,

    @InjectRepository(ListPlace)
    private readonly listPlacesRepository: Repository<ListPlace>,

    @InjectRepository(ListComment)
    private readonly commentsRepository: Repository<ListComment>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Place)
    private readonly placesRepository: Repository<Place>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    dto: CreateListDto,
  ): Promise<PlaceList> {
    return this.dataSource.transaction(
      async (manager) => {
        const list = manager.create(
          PlaceList,
          {
            createdById: userId,
            name: dto.name.trim(),
            description:
              dto.description?.trim() ||
              null,
          },
        );

        const savedList =
          await manager.save(
            PlaceList,
            list,
          );

        const membership =
          manager.create(ListMember, {
            listId: savedList.id,
            userId,
            role:
              ListMemberRole.CREATOR,
          });

        await manager.save(
          ListMember,
          membership,
        );

        return savedList;
      },
    );
  }

  async findAllForUser(
    userId: string,
  ): Promise<
    Array<{
      list: PlaceList;
      role: ListMemberRole;
    }>
  > {
    const memberships =
      await this.membersRepository.find({
        where: {
          userId,
        },
        relations: {
          list: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    return memberships.map(
      (membership) => ({
        list: membership.list,
        role: membership.role,
      }),
    );
  }

  async findOne(
    userId: string,
    listId: string,
  ) {
    const membership =
      await this.requireMembership(
        listId,
        userId,
      );

    const list =
      await this.findListOrFail(
        listId,
      );

    const members =
      await this.membersRepository
        .createQueryBuilder('member')
        .innerJoin(
          'member.user',
          'user',
        )
        .select([
          'member.id',
          'member.userId',
          'member.role',
          'member.createdAt',
          'user.id',
          'user.email',
          'user.displayName',
          'user.avatarUrl',
        ])
        .where(
          'member.listId = :listId',
          {
            listId,
          },
        )
        .orderBy(
          'member.createdAt',
          'ASC',
        )
        .getMany();

    const places =
      await this.listPlacesRepository.find({
        where: {
          listId,
        },
        relations: {
          place: true,
        },
        order: {
          createdAt: 'DESC',
        },
      });

    const comments =
      await this.findComments(
        userId,
        listId,
      );

    return {
      ...list,
      currentUserRole:
        membership.role,
      members,
      places,
      comments,
    };
  }

  async update(
    userId: string,
    listId: string,
    dto: UpdateListDto,
  ): Promise<PlaceList> {
    await this.requireEditor(
      listId,
      userId,
    );

    const list =
      await this.findListOrFail(
        listId,
      );

    if (dto.name !== undefined) {
      list.name =
        dto.name.trim();
    }

    if (
      dto.description !==
      undefined
    ) {
      list.description =
        dto.description.trim() ||
        null;
    }

    return this.listsRepository.save(
      list,
    );
  }

  async remove(
    userId: string,
    listId: string,
  ): Promise<void> {
    await this.requireCreator(
      listId,
      userId,
    );

    const list =
      await this.findListOrFail(
        listId,
      );

    await this.listsRepository.remove(
      list,
    );
  }

  async addMember(
    userId: string,
    listId: string,
    dto: AddMemberDto,
  ): Promise<ListMember> {
    await this.requireCreator(
      listId,
      userId,
    );

    const targetUser =
      await this.usersRepository
        .createQueryBuilder('user')
        .where(
          'LOWER(user.email) = LOWER(:email)',
          {
            email:
              dto.email.trim(),
          },
        )
        .andWhere(
          'user.isActive = true',
        )
        .getOne();

    if (!targetUser) {
      throw new NotFoundException(
        'Utilisateur introuvable.',
      );
    }

    const existing =
      await this.membersRepository.findOne({
        where: {
          listId,
          userId: targetUser.id,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Cet utilisateur est déjà membre de la liste.',
      );
    }

    const member =
      this.membersRepository.create({
        listId,
        userId: targetUser.id,
        role: dto.role,
      });

    return this.membersRepository.save(
      member,
    );
  }

  async updateMemberRole(
    userId: string,
    listId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<ListMember> {
    await this.requireCreator(
      listId,
      userId,
    );

    const member =
      await this.membersRepository.findOne({
        where: {
          id: memberId,
          listId,
        },
      });

    if (!member) {
      throw new NotFoundException(
        'Membre introuvable.',
      );
    }

    if (
      member.role ===
      ListMemberRole.CREATOR
    ) {
      throw new ForbiddenException(
        'Le rôle du créateur ne peut pas être modifié.',
      );
    }

    member.role = dto.role;

    return this.membersRepository.save(
      member,
    );
  }

  async removeMember(
    userId: string,
    listId: string,
    memberId: string,
  ): Promise<void> {
    await this.requireCreator(
      listId,
      userId,
    );

    const member =
      await this.membersRepository.findOne({
        where: {
          id: memberId,
          listId,
        },
      });

    if (!member) {
      throw new NotFoundException(
        'Membre introuvable.',
      );
    }

    if (
      member.role ===
      ListMemberRole.CREATOR
    ) {
      throw new ForbiddenException(
        'Le créateur ne peut pas être retiré de la liste.',
      );
    }

    await this.membersRepository.remove(
      member,
    );
  }

  async addPlace(
    userId: string,
    listId: string,
    dto: AddPlaceDto,
  ): Promise<ListPlace> {
    await this.requireEditor(
      listId,
      userId,
    );

    const place =
      await this.placesRepository.findOneBy(
        {
          id: dto.placeId,
        },
      );

    if (!place) {
      throw new NotFoundException(
        'Lieu introuvable.',
      );
    }

    const existing =
      await this.listPlacesRepository.findOne({
        where: {
          listId,
          placeId: dto.placeId,
        },
      });

    if (existing) {
      throw new ConflictException(
        'Ce lieu est déjà présent dans la liste.',
      );
    }

    const listPlace =
      this.listPlacesRepository.create({
        listId,
        placeId: dto.placeId,
        addedById: userId,
      });

    return this.listPlacesRepository.save(
      listPlace,
    );
  }

  async removePlace(
    userId: string,
    listId: string,
    placeId: string,
  ): Promise<void> {
    await this.requireEditor(
      listId,
      userId,
    );

    const listPlace =
      await this.listPlacesRepository.findOne({
        where: {
          listId,
          placeId,
        },
      });

    if (!listPlace) {
      throw new NotFoundException(
        'Ce lieu ne se trouve pas dans la liste.',
      );
    }

    await this.listPlacesRepository.remove(
      listPlace,
    );
  }

  async searchPlaces(
    userId: string,
    listId: string,
    dto: SearchListPlacesDto,
  ): Promise<Place[]> {
    await this.requireMembership(
      listId,
      userId,
    );

    const query =
      this.placesRepository
        .createQueryBuilder('place')
        .innerJoin(
          'list_places',
          'list_place',
          `
          list_place.place_id = place.id
          AND list_place.list_id = :listId
          `,
          {
            listId,
          },
        );

    if (dto.search) {
      query.andWhere(
        `
        (
          place.name ILIKE :search
          OR place.description ILIKE :search
        )
        `,
        {
          search:
            `%${dto.search.trim()}%`,
        },
      );
    }

    if (dto.category) {
      query.andWhere(
        'LOWER(place.category) = LOWER(:category)',
        {
          category:
            dto.category.trim(),
        },
      );
    }

    if (dto.city) {
      query.andWhere(
        'LOWER(place.city) = LOWER(:city)',
        {
          city:
            dto.city.trim(),
        },
      );
    }

    if (
      dto.minRating !==
      undefined
    ) {
      query.andWhere(
        'place.ratingAverage >= :minRating',
        {
          minRating:
            dto.minRating,
        },
      );
    }

    if (dto.tags) {
      const tags = dto.tags
        .split(',')
        .map(
          (tag) =>
            tag
              .trim()
              .toLowerCase(),
        )
        .filter(Boolean);

      if (tags.length > 0) {
        query.andWhere(
          'place.tags && :tags',
          {
            tags,
          },
        );
      }
    }

    return query
      .orderBy(
        'place.name',
        'ASC',
      )
      .getMany();
  }

  async findComments(
    userId: string,
    listId: string,
  ): Promise<ListComment[]> {
    await this.requireMembership(
      listId,
      userId,
    );

    return this.commentsRepository
      .createQueryBuilder('comment')
      .innerJoinAndSelect(
        'comment.user',
        'user',
      )
      .select([
        'comment.id',
        'comment.listId',
        'comment.userId',
        'comment.comment',
        'comment.createdAt',
        'comment.updatedAt',
        'user.id',
        'user.displayName',
        'user.avatarUrl',
      ])
      .where(
        'comment.listId = :listId',
        {
          listId,
        },
      )
      .orderBy(
        'comment.createdAt',
        'DESC',
      )
      .getMany();
  }

  async addComment(
    userId: string,
    listId: string,
    dto: CreateListCommentDto,
  ): Promise<ListComment> {
    await this.requireCommentPermission(
      listId,
      userId,
    );

    const comment =
      this.commentsRepository.create({
        listId,
        userId,
        comment:
          dto.comment.trim(),
      });

    return this.commentsRepository.save(
      comment,
    );
  }

  async removeComment(
    userId: string,
    listId: string,
    commentId: string,
  ): Promise<void> {
    const membership =
      await this.requireMembership(
        listId,
        userId,
      );

    const comment =
      await this.commentsRepository.findOne({
        where: {
          id: commentId,
          listId,
        },
      });

    if (!comment) {
      throw new NotFoundException(
        'Commentaire introuvable.',
      );
    }

    const isAuthor =
      comment.userId === userId;

    const isCreator =
      membership.role ===
      ListMemberRole.CREATOR;

    if (
      !isAuthor &&
      !isCreator
    ) {
      throw new ForbiddenException(
        "Vous n'êtes pas autorisé à supprimer ce commentaire.",
      );
    }

    await this.commentsRepository.remove(
      comment,
    );
  }

  private async findListOrFail(
    listId: string,
  ): Promise<PlaceList> {
    const list =
      await this.listsRepository.findOneBy(
        {
          id: listId,
        },
      );

    if (!list) {
      throw new NotFoundException(
        'Liste introuvable.',
      );
    }

    return list;
  }

  private async requireMembership(
    listId: string,
    userId: string,
  ): Promise<ListMember> {
    await this.findListOrFail(
      listId,
    );

    const membership =
      await this.membersRepository.findOne({
        where: {
          listId,
          userId,
        },
      });

    if (!membership) {
      throw new ForbiddenException(
        "Vous n'avez pas accès à cette liste.",
      );
    }

    return membership;
  }

  private async requireEditor(
    listId: string,
    userId: string,
  ): Promise<ListMember> {
    const membership =
      await this.requireMembership(
        listId,
        userId,
      );

    if (
      membership.role !==
        ListMemberRole.CREATOR &&
      membership.role !==
        ListMemberRole.EDITOR
    ) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de modifier cette liste.",
      );
    }

    return membership;
  }

  private async requireCreator(
    listId: string,
    userId: string,
  ): Promise<ListMember> {
    const membership =
      await this.requireMembership(
        listId,
        userId,
      );

    if (
      membership.role !==
      ListMemberRole.CREATOR
    ) {
      throw new ForbiddenException(
        'Seul le créateur de la liste peut effectuer cette action.',
      );
    }

    return membership;
  }

  private async requireCommentPermission(
    listId: string,
    userId: string,
  ): Promise<ListMember> {
    const membership =
      await this.requireMembership(
        listId,
        userId,
      );

    const allowedRoles = [
      ListMemberRole.CREATOR,
      ListMemberRole.EDITOR,
      ListMemberRole.COMMENTER,
    ];

    if (
      !allowedRoles.includes(
        membership.role,
      )
    ) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de commenter cette liste.",
      );
    }

    return membership;
  }
}