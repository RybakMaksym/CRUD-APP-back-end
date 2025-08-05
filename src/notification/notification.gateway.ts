import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { NotificationEvents } from '@/enums/notification.enums';
import { INotification } from '@/notification/notification.types';

@WebSocketGateway({ cors: true })
export class NotificationGateway {
  @WebSocketServer()
  private readonly server: Server;

  public sendNotification(userId: string, payload: INotification): void {
    this.server.to(userId).emit(NotificationEvents.NOTIFICATION, payload);
  }

  public handleConnection(socket: Socket): void {
    const userId = socket.handshake.query.userId;

    if (userId) {
      socket.join(userId);
    }
  }
}
