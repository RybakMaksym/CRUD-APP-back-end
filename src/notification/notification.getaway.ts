import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { INotification } from '@/notification/types/notification';

@WebSocketGateway({ cors: true })
export class NotificationGetaway {
  @WebSocketServer()
  server: Server;

  public sendNotification(userId: string, payload: INotification): void {
    this.server.to(userId).emit('notification', payload);
  }

  public handleConnection(socket: Socket): void {
    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(userId);
    }
  }
}
