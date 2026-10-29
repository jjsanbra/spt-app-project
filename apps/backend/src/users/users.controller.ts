import { Body, Controller, Get, HttpStatus, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserSummaryDto } from '../auth/dto/auth-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserDashboardResponseDto } from './dto/user-dashboard-response.dto';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller({ path: 'users', version: '1' })
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Obtener métricas personales, actividad y próxima reserva del usuario' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard del usuario obtenido exitosamente',
    type: UserDashboardResponseDto,
  })
  async getDashboard(
    @CurrentUser('id') userId: string,
  ): Promise<UserDashboardResponseDto> {
    return this.usersService.getDashboard(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Actualizar los datos del perfil del usuario autenticado' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil actualizado exitosamente',
    type: UserSummaryDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autenticado o token expirado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de perfil no válidos' })
  async updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserSummaryDto> {
    return this.usersService.updateProfile(userId, dto);
  }
}
