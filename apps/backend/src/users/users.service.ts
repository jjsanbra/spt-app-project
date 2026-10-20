import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSummaryDto } from '../auth/dto/auth-response.dto';
import { PrismaService } from '../core/database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserSummaryDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName !== undefined && { firstName: dto.firstName }),
        ...(dto.lastName !== undefined && { lastName: dto.lastName }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.avatarUrl !== undefined && { avatarUrl: dto.avatarUrl }),
      },
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

    return {
      id: updated.id,
      email: updated.email,
      firstName: updated.firstName,
      lastName: updated.lastName,
      phone: updated.phone,
      avatarUrl: updated.avatarUrl,
      isSuperAdmin: updated.isSuperAdmin,
      memberships: (updated.memberships || [])
        .filter((m) => m.club && m.club.isActive)
        .map((m) => ({
          clubId: m.club.id,
          clubName: m.club.name,
          clubSlug: m.club.slug,
          role: m.role,
          memberNumber: m.memberNumber,
          walletBalance: Number(m.walletBalance),
        })),
    };
  }
}
