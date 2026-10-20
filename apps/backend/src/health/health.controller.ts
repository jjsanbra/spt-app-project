import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { HealthService } from './health.service';

/**
 * HealthController — Endpoint de health check para Render y monitorización.
 * GET /api/health
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Health check del sistema' })
  async check() {
    return this.healthService.check();
  }
}
