import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  namespace: 'notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NotificationsGateway.name);

  constructor(private readonly jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        (client.handshake.headers?.authorization?.replace('Bearer ', '') as string) ||
        (client.handshake.query?.token as string);

      if (!token) {
        this.logger.debug(`Socket ${client.id} desconectado: sin token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const userId = payload.sub || payload.id;

      if (!userId) {
        client.disconnect();
        return;
      }

      // Unir socket a la sala privada del usuario
      client.data.userId = userId;
      client.join(`user:${userId}`);

      if (payload.clubId) {
        client.data.clubId = payload.clubId;
        client.join(`club:${payload.clubId}`);
      }

      this.logger.log(`Cliente WebSocket conectado: user:${userId} (socket ${client.id})`);
    } catch (err) {
      this.logger.debug(`Fallo al autenticar socket ${client.id}: ${(err as Error).message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Cliente WebSocket desconectado: ${client.id}`);
  }

  /**
   * Emitir notificación en tiempo real a la sala del usuario
   */
  sendToUser(userId: string, event: string, payload: any): void {
    if (this.server) {
      this.server.to(`user:${userId}`).emit(event, payload);
      this.logger.debug(`Evento "${event}" emitido a sala user:${userId}`);
    }
  }

  /**
   * Emitir evento en tiempo real a todos los socios/staff de un club
   */
  sendToClub(clubId: string, event: string, payload: any): void {
    if (this.server) {
      this.server.to(`club:${clubId}`).emit(event, payload);
      this.logger.debug(`Evento "${event}" emitido a sala club:${clubId}`);
    }
  }
}
