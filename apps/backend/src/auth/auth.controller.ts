import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';
import {
  AuthResponseDto,
  TokenResponseDto,
  UserSummaryDto,
} from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario en la plataforma' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Usuario registrado exitosamente',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'El correo electrónico ya existe' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Datos de registro inválidos' })
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Iniciar sesión con email y contraseña' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Credenciales válidas, sesión iniciada',
    type: AuthResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciales inválidas o cuenta inactiva' })
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar el Access Token utilizando un Refresh Token válido' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Nuevo token generado exitosamente',
    type: TokenResponseDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Refresh token inválido o expirado' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<TokenResponseDto> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión activa' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Sesión cerrada correctamente' })
  async logout(): Promise<{ message: string }> {
    return { message: 'Sesión cerrada exitosamente' };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Consultar el perfil del usuario autenticado y sus membresías de club' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Perfil del usuario con clubes asociados',
    type: UserSummaryDto,
  })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'No autenticado o token expirado' })
  async getMe(@CurrentUser('id') userId: string): Promise<UserSummaryDto> {
    return this.authService.getMe(userId);
  }
}
