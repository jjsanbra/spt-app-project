import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ example: 'Alejandro', description: 'Nombre del usuario', required: false })
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  firstName?: string;

  @ApiProperty({ example: 'García', description: 'Apellidos del usuario', required: false })
  @IsOptional()
  @IsString({ message: 'Los apellidos deben ser una cadena de texto' })
  @MinLength(2, { message: 'Los apellidos deben tener al menos 2 caracteres' })
  lastName?: string;

  @ApiProperty({ example: '+34600112233', description: 'Teléfono de contacto', required: false })
  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'URL del avatar', required: false })
  @IsOptional()
  @IsString({ message: 'El avatar debe ser una cadena de texto' })
  avatarUrl?: string;
}
