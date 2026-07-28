import { Controller, Get } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Health')
@Controller('health')
export class AppController {
  @Get()
  @ApiOperation({
    summary: "Vérifier l'état de l'API",
  })
  @ApiResponse({
    status: 200,
    description: "L'API fonctionne correctement.",
  })
  checkHealth() {
    return {
      status: 'ok',
      service: 'supstar-api',
      timestamp: new Date().toISOString(),
    };
  }
}