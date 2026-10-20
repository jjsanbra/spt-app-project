import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';

export class MemberUserSummaryDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string;

  @ApiProperty({ example: 'usuario@club.com' })
  email: string;

  @ApiProperty({ example: 'Carlos' })
  firstName: string;

  @ApiProperty({ example: 'Martínez' })
  lastName: string;

  @ApiPropertyOptional({ example: '+34600000000', nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/carlos.jpg', nullable: true })
  avatarUrl?: string | null;
}

export class ClubMemberResponseDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d' })
  id: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  userId: string;

  @ApiProperty({ example: '888e4567-e89b-12d3-a456-426614174000' })
  clubId: string;

  @ApiProperty({ enum: ClubRole, example: ClubRole.MEMBER })
  role: ClubRole;

  @ApiProperty({ example: 0.0, description: 'Saldo en el monedero del club' })
  walletBalance: number;

  @ApiPropertyOptional({ example: 'SOCIO-001', nullable: true })
  memberNumber?: string | null;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: '2026-10-20T10:00:00.000Z' })
  updatedAt: Date;

  @ApiProperty({ type: MemberUserSummaryDto })
  user: MemberUserSummaryDto;
}
