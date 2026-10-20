import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ClubRole } from '@prisma/client';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class InviteMemberDto {
  @ApiProperty({
    example: 'nuevo.socio@club.com',
    description: 'Correo electrónico del usuario a invitar o asociar al club',
  })
  @IsEmail({}, { message: 'El correo electrónico debe ser válido' })
  @IsNotEmpty({ message: 'El correo electrónico es obligatorio' })
  email: string;

  @ApiPropertyOptional({
    enum: ClubRole,
    default: ClubRole.MEMBER,
    description: 'Rol que tendrá el socio en el club',
  })
  @IsOptional()
  @IsEnum(ClubRole, { message: 'El rol especificado no es válido' })
  role?: ClubRole = ClubRole.MEMBER;

  @ApiPropertyOptional({
    example: 'SOCIO-102',
    description: 'Número de socio asignado internamente por el club',
  })
  @IsOptional()
  @IsString({ message: 'El número de socio debe ser una cadena de texto' })
  @MaxLength(50, { message: 'El número de socio no puede superar 50 caracteres' })
  memberNumber?: string;
}
