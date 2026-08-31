import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type {
  Request,
  Response,
} from 'express';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { User } from '../users/entities/user.entity';
import { DataTransferService } from './data-transfer.service';
import { ExportPlacesDto } from './dto/export-places.dto';
import { ImportPlacesDto } from './dto/import-places.dto';

interface AuthenticatedRequest
  extends Request {
  user: User;
}

@ApiTags('Import / Export')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('data')
export class DataTransferController {
  constructor(
    private readonly dataTransferService: DataTransferService,
  ) {}

  @Get('export/places')
  @ApiOperation({
    summary:
      'Exporter les lieux en JSON ou CSV',
  })
  async exportPlaces(
    @Query()
    query: ExportPlacesDto,
    @Res()
    response: Response,
  ): Promise<void> {
    const result =
      await this.dataTransferService.exportPlaces(
        query.format ?? 'json',
      );

    response.setHeader(
      'Content-Type',
      result.contentType,
    );

    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${result.fileName}"`,
    );

    response.send(
      result.content,
    );
  }

  @Post('import/places')
  @ApiOperation({
    summary:
      'Importer des lieux depuis du JSON ou du CSV',
  })
  importPlaces(
    @Req()
    request: AuthenticatedRequest,
    @Body()
    dto: ImportPlacesDto,
  ) {
    return this.dataTransferService.importPlaces(
      request.user.id,
      dto,
    );
  }
}