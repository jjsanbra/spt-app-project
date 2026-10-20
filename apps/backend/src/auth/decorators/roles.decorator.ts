import { SetMetadata } from '@nestjs/common';
import { ClubRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: ClubRole[]) => SetMetadata(ROLES_KEY, roles);
