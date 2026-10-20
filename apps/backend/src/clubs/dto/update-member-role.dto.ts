import { ApiProperty } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';
import { IsEnum, IsNotEmpty } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({
    enum: ClubRole,
    example: ClubRole.ADMIN,
    description: 'Nuevo rol asignado a la membresía del club',
  })
  @IsNotEmpty({ message: 'El rol es obligatorio' })
  @IsEnum(ClubRole, { message: 'El rol especificado no es válido' })
  role: ClubRole;
}
