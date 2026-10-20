import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateMemberStatusDto {
  @ApiProperty({
    example: true,
    description: 'Estado de activación de la membresía del socio',
  })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsBoolean({ message: 'El estado debe ser un booleano (true o false)' })
  isActive: boolean;
}
