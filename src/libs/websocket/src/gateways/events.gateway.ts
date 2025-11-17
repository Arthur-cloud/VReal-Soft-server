import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { WebSocketEvent } from '../enums/websocket-events.enum';
import {
  WebSocketEventMap,
  FilePayload,
  FolderPayload,
  PermissionPayload,
} from '../types/websocket.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  declare server: Server;

  private readonly logger = new Logger(EventsGateway.name);
  private readonly userSockets = new Map<string, Set<string>>(); // userId -> Set<socketId>

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket): Promise<void> {
    try {
      const token = this.extractToken(client);

      if (!token) {
        this.logger.warn(`Connection rejected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      });

      const userId = payload.sub as string;

      this.addUserSocket(userId, client.id);
      client.data.userId = userId;

      await client.join(`user:${userId}`);

      this.logger.log(`Client connected: ${client.id}, User: ${userId}`);
    } catch (error) {
      this.logger.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket): void {
    const userId = client.data.userId as string | undefined;

    if (userId) {
      this.removeUserSocket(userId, client.id);
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // Generic emit methods with type safety
  emitToUser<K extends keyof WebSocketEventMap>(
    userId: string,
    event: K,
    data: WebSocketEventMap[K],
  ): void {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToMultipleUsers<K extends keyof WebSocketEventMap>(
    userIds: string[],
    event: K,
    data: WebSocketEventMap[K],
  ): void {
    userIds.forEach((userId) => this.emitToUser(userId, event, data));
  }

  // File notification methods
  notifyFileCreated(ownerId: string, file: FilePayload): void {
    this.emitToUser(ownerId, WebSocketEvent.FILE_CREATED, { file });
  }

  notifyFileUpdated(
    ownerId: string,
    file: FilePayload,
    sharedWithUserIds: string[] = [],
  ): void {
    this.emitToUser(ownerId, WebSocketEvent.FILE_UPDATED, { file });
    this.emitToMultipleUsers(sharedWithUserIds, WebSocketEvent.FILE_UPDATED, {
      file,
    });
  }

  notifyFileDeleted(
    ownerId: string,
    fileId: string,
    sharedWithUserIds: string[] = [],
  ): void {
    const payload = { id: fileId };
    this.emitToUser(ownerId, WebSocketEvent.FILE_DELETED, payload);
    this.emitToMultipleUsers(
      sharedWithUserIds,
      WebSocketEvent.FILE_DELETED,
      payload,
    );
  }

  notifyFileShared(
    ownerId: string,
    sharedWithUserId: string,
    file: FilePayload,
    permission: PermissionPayload,
  ): void {
    this.emitToUser(ownerId, WebSocketEvent.FILE_SHARED, {
      file,
      sharedWith: sharedWithUserId,
      permission,
    });
    this.emitToUser(sharedWithUserId, WebSocketEvent.PERMISSION_GRANTED, {
      file,
      permission,
    });
  }

  // Folder notification methods
  notifyFolderCreated(ownerId: string, folder: FolderPayload): void {
    this.emitToUser(ownerId, WebSocketEvent.FOLDER_CREATED, { folder });
  }

  notifyFolderUpdated(
    ownerId: string,
    folder: FolderPayload,
    sharedWithUserIds: string[] = [],
  ): void {
    this.emitToUser(ownerId, WebSocketEvent.FOLDER_UPDATED, { folder });
    this.emitToMultipleUsers(
      sharedWithUserIds,
      WebSocketEvent.FOLDER_UPDATED,
      { folder },
    );
  }

  notifyFolderDeleted(
    ownerId: string,
    folderId: string,
    sharedWithUserIds: string[] = [],
  ): void {
    const payload = { id: folderId };
    this.emitToUser(ownerId, WebSocketEvent.FOLDER_DELETED, payload);
    this.emitToMultipleUsers(
      sharedWithUserIds,
      WebSocketEvent.FOLDER_DELETED,
      payload,
    );
  }

  notifyFolderShared(
    ownerId: string,
    sharedWithUserId: string,
    folder: FolderPayload,
    permission: PermissionPayload,
  ): void {
    this.emitToUser(ownerId, WebSocketEvent.FOLDER_SHARED, {
      folder,
      sharedWith: sharedWithUserId,
      permission,
    });
    this.emitToUser(sharedWithUserId, WebSocketEvent.PERMISSION_GRANTED, {
      folder,
      permission,
    });
  }

  // Permission notification methods
  notifyPermissionRevoked(
    userId: string,
    resourceId: string,
    resourceType: 'file' | 'folder',
  ): void {
    this.emitToUser(userId, WebSocketEvent.PERMISSION_REVOKED, {
      resourceId,
      resourceType,
    });
  }

  notifyPermissionUpdated(
    userId: string,
    permission: PermissionPayload,
  ): void {
    this.emitToUser(userId, WebSocketEvent.PERMISSION_UPDATED, { permission });
  }

  // Utility methods
  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: Socket): string {
    return 'pong';
  }

  isUserConnected(userId: string): boolean {
    const sockets = this.userSockets.get(userId);
    return sockets ? sockets.size > 0 : false;
  }

  getUserSocketCount(userId: string): number {
    return this.userSockets.get(userId)?.size ?? 0;
  }

  // Private helper methods
  private extractToken(client: Socket): string | null {
    return (
      client.handshake.auth['token'] ||
      client.handshake.headers.authorization?.split(' ')[1] ||
      null
    );
  }

  private addUserSocket(userId: string, socketId: string): void {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socketId);
  }

  private removeUserSocket(userId: string, socketId: string): void {
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }
}
