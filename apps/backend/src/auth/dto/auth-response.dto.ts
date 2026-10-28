import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';

export class ClubMembershipSummaryDto {
  @ApiProperty({ example: '5a298a06-e5c6-457a-af99-2a0673263f26', description: 'ID del club' })
  clubId: string;

  @ApiProperty({ example: 'Club Deportivo Central Pádel & Tenis', description: 'Nombre del club' })
  clubName: string;

  @ApiProperty({ example: 'central-padel', description: 'Slug del club' })
  clubSlug: string;

  @ApiPropertyOptional({ type: String, example: 'Barcelona', nullable: true, description: 'Ciudad o localidad donde radica el club' })
  clubCity?: string | null;

  @ApiProperty({ enum: ClubRole, example: ClubRole.MEMBER, description: 'Rol del usuario en el club' })
  role: ClubRole;

  @ApiProperty({ type: String, example: 'SOC-001', required: false, nullable: true, description: 'Número de socio' })
  memberNumber?: string | null;

  @ApiProperty({ example: 50.0, description: 'Saldo en el monedero virtual del club' })
  walletBalance: number;
}

export class UserSummaryDto {
  @ApiProperty({ example: '8df98b1f-c3b5-4267-b564-c89d65500cb7', description: 'ID del usuario' })
  id: string;

  @ApiProperty({ example: 'socio@spt-app.local', description: 'Correo electrónico' })
  email: string;

  @ApiProperty({ example: 'Marcos', description: 'Nombre del usuario' })
  firstName: string;

  @ApiProperty({ example: 'Gómez', description: 'Apellidos del usuario' })
  lastName: string;

  @ApiProperty({ type: String, example: '+34622222222', required: false, nullable: true, description: 'Teléfono' })
  phone?: string | null;

  @ApiProperty({ type: String, example: null, required: false, nullable: true, description: 'URL del avatar' })
  avatarUrl?: string | null;

  @ApiProperty({ example: false, description: 'Indica si es administrador global del SaaS' })
  isSuperAdmin: boolean;

  @ApiProperty({ type: [ClubMembershipSummaryDto], description: 'Membresías del usuario en clubes' })
  memberships: ClubMembershipSummaryDto[];
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access token (expira en 15 minutos)',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Refresh token (expira en 7 días)',
  })
  refreshToken: string;

  @ApiProperty({ type: UserSummaryDto, description: 'Datos del usuario autenticado' })
  user: UserSummaryDto;
}

export class TokenResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Nuevo JWT Access token',
  })
  accessToken: string;
}
