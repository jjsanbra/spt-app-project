import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ClubRole } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { AuthResponseDto, TokenResponseDto, UserSummaryDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtPayload } from './strategies/jwt.strategy';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        firstName: dto.firstName,
        lastName: dto.lastName,
        phone: dto.phone,
      },
      include: {
        memberships: {
          include: {
            club: true,
          },
        },
      },
    });

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapUserSummary(user),
    };
  }

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Tu cuenta ha sido desactivada. Contacta con soporte.');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Correo electrónico o contraseña incorrectos');
    }

    const tokens = await this.generateTokens({
      sub: user.id,
      email: user.email,
      isSuperAdmin: user.isSuperAdmin,
    });

    let extraClubs: any[] = [];
    if (user.isSuperAdmin && (!user.memberships || user.memberships.length === 0)) {
      extraClubs = await this.prisma.club.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, isActive: true },
      });
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: this.mapUserSummary(user, extraClubs),
    };
  }

  async refresh(refreshToken: string): Promise<TokenResponseDto> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>(
          'JWT_REFRESH_SECRET',
          'changeme_refresh_secret_min_64_chars_use_openssl_in_production',
        ),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, email: true, isSuperAdmin: true, isActive: true },
      });

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Sesión no válida o expirada');
      }

      const newAccessToken = this.jwtService.sign(
        {
          sub: user.id,
          email: user.email,
          isSuperAdmin: user.isSuperAdmin,
        },
        {
          secret: this.configService.get<string>(
            'JWT_ACCESS_SECRET',
            'changeme_access_secret_min_64_chars_use_openssl_in_production',
          ),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
        },
      );

      return { accessToken: newAccessToken };
    } catch (error) {
      this.logger.warn(`Error al renovar token: ${error.message}`);
      throw new UnauthorizedException('El refresh token es inválido o ha expirado');
    }
  }

  async getMe(userId: string): Promise<UserSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        memberships: {
          where: { isActive: true },
          include: {
            club: {
              select: {
                id: true,
                name: true,
                slug: true,
                isActive: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    let extraClubs: any[] = [];
    if (user.isSuperAdmin && (!user.memberships || user.memberships.length === 0)) {
      extraClubs = await this.prisma.club.findMany({
        where: { isActive: true },
        select: { id: true, name: true, slug: true, isActive: true },
      });
    }

    return this.mapUserSummary(user, extraClubs);
  }

  private async generateTokens(payload: JwtPayload): Promise<{ accessToken: string; refreshToken: string }> {
    const accessSecret = this.configService.get<string>(
      'JWT_ACCESS_SECRET',
      'changeme_access_secret_min_64_chars_use_openssl_in_production',
    );
    const refreshSecret = this.configService.get<string>(
      'JWT_REFRESH_SECRET',
      'changeme_refresh_secret_min_64_chars_use_openssl_in_production',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRES_IN', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private mapUserSummary(user: any, extraClubs: any[] = []): UserSummaryDto {
    const directMemberships = (user.memberships || [])
      .filter((m: any) => m.club && m.club.isActive)
      .map((m: any) => ({
        clubId: m.club.id,
        clubName: m.club.name,
        clubSlug: m.club.slug,
        role: m.role,
        memberNumber: m.memberNumber,
        walletBalance: Number(m.walletBalance),
      }));

    const memberships =
      directMemberships.length > 0
        ? directMemberships
        : extraClubs.map((c) => ({
            clubId: c.id,
            clubName: c.name,
            clubSlug: c.slug,
            role: ClubRole.OWNER,
            memberNumber: 'SUPERADMIN',
            walletBalance: 0,
          }));

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
      isSuperAdmin: user.isSuperAdmin,
      memberships,
    };
  }
}
