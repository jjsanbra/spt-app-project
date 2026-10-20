import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ParticipantStatus, SportType } from '@prisma/client';

export class OpenMatchParticipantDto {
  @ApiProperty({ example: 'part-uuid-1' })
  id: string;

  @ApiPropertyOptional({ example: 'user-uuid-1', type: String, nullable: true })
  userId?: string | null;

  @ApiProperty({ example: 'Carlos Martínez' })
  name: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb', type: String, nullable: true })
  avatarUrl?: string | null;

  @ApiProperty({ example: 1, description: 'Número de plaza del 1 al máximo de jugadores' })
  slotNumber: number;

  @ApiProperty({ example: true, description: 'Indica si este participante es el anfitrión/creador de la partida' })
  isHost: boolean;

  @ApiProperty({ enum: ParticipantStatus, example: ParticipantStatus.REGISTERED })
  status: ParticipantStatus;

  @ApiProperty({ example: '2026-10-20T12:00:00.000Z' })
  joinedAt: Date;
}

export class OpenMatchResponseDto {
  @ApiProperty({ example: 'book-uuid-1' })
  id: string;

  @ApiProperty({ example: 'club-uuid-1' })
  clubId: string;

  @ApiProperty({ example: 'fac-uuid-1' })
  facilityId: string;

  @ApiProperty({ example: 'Pista 1 Central' })
  facilityName: string;

  @ApiProperty({ enum: SportType, example: SportType.PADEL })
  sportType: SportType;

  @ApiProperty({ example: '2026-10-25T18:00:00.000Z' })
  startTime: Date;

  @ApiProperty({ example: '2026-10-25T19:30:00.000Z' })
  endTime: Date;

  @ApiProperty({ example: 24.0, description: 'Precio total del alquiler de la pista' })
  totalPrice: number;

  @ApiProperty({ example: 6.0, description: 'Precio individual que abona cada jugador' })
  pricePerPlayer: number;

  @ApiProperty({ example: 4, description: 'Número máximo de jugadores en la pista' })
  maxPlayers: number;

  @ApiProperty({ example: 2, description: 'Número de plazas aún disponibles para unirse' })
  availableSlots: number;

  @ApiProperty({ example: 2, description: 'Número de plazas ya ocupadas' })
  occupiedSlots: number;

  @ApiProperty({ example: false, description: 'Indica si el usuario que consulta ya está inscrito' })
  isCurrentUserJoined: boolean;

  @ApiProperty({ example: false, description: 'Indica si el usuario que consulta es el anfitrión de la partida' })
  isCurrentUserHost: boolean;

  @ApiPropertyOptional({ example: 'Buscamos nivel intermedio 3.5', type: String, nullable: true })
  notes?: string | null;

  @ApiProperty({ type: [OpenMatchParticipantDto] })
  participants: OpenMatchParticipantDto[];
}
