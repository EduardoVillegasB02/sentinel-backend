import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class WsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger('WebSocket');

  constructor(private readonly jwtService: JwtService) {}

  handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token;
      if (!token) {
        client.disconnect();
        throw new UnauthorizedException('Token requerido');
      }
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;
      if (!userId) {
        client.disconnect();
        throw new UnauthorizedException('Token inválido');
      }
      const ip = client.handshake.address;
      client.join(`user:${userId}`);
      client.join(`session:${userId}:${ip}`);
      this.logger.log(
        `Connected: ${client.id}`,
      );
    } catch (error) {
      this.logger.error('Error:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Disconnected: ${client.id}`);
  }

  logoutAll(userId: string) {
    this.server.to(`user:${userId}`).emit('force_logout');
  }

  logoutByIp(userId: string, ip: string) {
    this.server.to(`session:${userId}:${ip}`).emit('force_logout');
  }
}
