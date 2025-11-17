import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FilePermissionEntity } from '@db/data-access/data-access-file-permission';
import { FileEntity } from '@db/data-access/data-access-file';
import { FolderEntity } from '@db/data-access/data-access-folder';
import { UserEntity } from '@db/data-access/data-access-user';
import { EventsGateway } from '@app/websocket';
import { EmailService } from '@app/email';
import { ConfigService } from '@nestjs/config';
import { ShareResourceDto } from './dto/share-resource.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PermissionsService {
  private readonly baseUrl: string;

  constructor(
    @InjectRepository(FilePermissionEntity)
    private permissionRepository: Repository<FilePermissionEntity>,
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
    @InjectRepository(FolderEntity)
    private folderRepository: Repository<FolderEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private readonly eventsGateway: EventsGateway,
    private readonly emailService: EmailService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:5173');
  }

  async shareResource(
    shareDto: ShareResourceDto,
    ownerId: string,
  ): Promise<FilePermissionEntity> {
    const { fileId, folderId, email, permission } = shareDto;

    if (!fileId && !folderId) {
      throw new BadRequestException(
        'Either fileId or folderId must be provided',
      );
    }

    if (fileId && folderId) {
      throw new BadRequestException(
        'Cannot share both file and folder at once',
      );
    }

    // Get owner info for email
    const owner = await this.userRepository.findOne({ where: { id: ownerId } });
    if (!owner) {
      throw new NotFoundException('Owner not found');
    }

    let resourceName = '';
    let resourceType: 'file' | 'folder' = 'file';

    if (fileId) {
      const file = await this.fileRepository.findOne({ where: { id: fileId } });
      if (!file) {
        throw new NotFoundException('File not found');
      }
      if (file.ownerId !== ownerId) {
        throw new ForbiddenException('You can only share your own files');
      }
      resourceName = file.name;
      resourceType = 'file';
    }

    if (folderId) {
      const folder = await this.folderRepository.findOne({
        where: { id: folderId },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      if (folder.ownerId !== ownerId) {
        throw new ForbiddenException('You can only share your own folders');
      }
      resourceName = folder.name;
      resourceType = 'folder';
    }

    const sharedWithUser = await this.userRepository.findOne({
      where: { email },
    });

    const existingPermission = await this.permissionRepository.findOne({
      where: {
        ...(fileId && { fileId }),
        ...(folderId && { folderId }),
        ...(sharedWithUser && { userId: sharedWithUser.id }),
        ...(!sharedWithUser && { email }),
      },
    });

    if (existingPermission) {
      const oldPermission = existingPermission.permission;
      existingPermission.permission = permission;
      const savedPermission =
        await this.permissionRepository.save(existingPermission);

      // Notify about permission update
      if (sharedWithUser) {
        this.eventsGateway.notifyPermissionUpdated(
          sharedWithUser.id,
          savedPermission,
        );

        // Send permission changed email
        try {
          await this.emailService.sendPermissionChangedNotification({
            recipientEmail: email,
            recipientName: email.split('@')[0],
            ownerName: owner?.email.split('@')[0] || 'Owner',
            resourceName,
            resourceType,
            oldPermission,
            newPermission: permission,
            accessUrl: `${this.baseUrl}/dashboard`,
          });
        } catch (error) {
          // Log but don't fail the operation if email fails
          console.error('Failed to send permission changed email:', error);
        }
      }

      return savedPermission;
    }

    const permissionData: Partial<FilePermissionEntity> = {
      fileId: fileId || undefined,
      folderId: folderId || undefined,
      userId: sharedWithUser?.id || undefined,
      email: sharedWithUser ? undefined : email,
      permission,
    };

    const savedPermission =
      await this.permissionRepository.save(permissionData);

    // Notify users via WebSocket
    if (sharedWithUser) {
      if (fileId) {
        const file = await this.fileRepository.findOne({
          where: { id: fileId },
          relations: ['owner'],
        });
        if (file) {
          this.eventsGateway.notifyFileShared(
            ownerId,
            sharedWithUser.id,
            file,
            savedPermission,
          );
        }
      } else if (folderId) {
        const folder = await this.folderRepository.findOne({
          where: { id: folderId },
          relations: ['owner'],
        });
        if (folder) {
          this.eventsGateway.notifyFolderShared(
            ownerId,
            sharedWithUser.id,
            folder,
            savedPermission,
          );
        }
      }

      // Send share notification email to existing user
      try {
        await this.emailService.sendShareNotification({
          recipientEmail: email,
          recipientName: email.split('@')[0],
          ownerName: owner?.email.split('@')[0] || 'Owner',
          resourceName,
          resourceType,
          permission,
          accessUrl: `${this.baseUrl}/dashboard`,
        });
      } catch (error) {
        console.error('Failed to send share notification email:', error);
      }
    } else {
      // Send invitation email to non-existing user
      try {
        await this.emailService.sendInviteNotification({
          recipientEmail: email,
          ownerName: owner?.email.split('@')[0] || 'Owner',
          resourceName,
          resourceType,
          permission,
          signupUrl: `${this.baseUrl}/register?email=${encodeURIComponent(email)}`,
          accessUrl: `${this.baseUrl}/dashboard`,
        });
      } catch (error) {
        console.error('Failed to send invite notification email:', error);
      }
    }

    return savedPermission;
  }

  async getResourcePermissions(
    resourceId: string,
    userId: string,
    type: 'file' | 'folder',
  ): Promise<FilePermissionEntity[]> {
    if (type === 'file') {
      const file = await this.fileRepository.findOne({
        where: { id: resourceId },
      });
      if (!file) {
        throw new NotFoundException('File not found');
      }
      if (file.ownerId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      return this.permissionRepository.find({
        where: { fileId: resourceId },
        relations: ['user'],
      });
    } else {
      const folder = await this.folderRepository.findOne({
        where: { id: resourceId },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      if (folder.ownerId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      return this.permissionRepository.find({
        where: { folderId: resourceId },
        relations: ['user'],
      });
    }
  }

  async getUserPermissions(userId: string): Promise<FilePermissionEntity[]> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.permissionRepository.find({
      where: [{ userId }, { email: user.email }],
      relations: ['file', 'folder'],
    });
  }

  async updatePermission(
    permissionId: string,
    updateDto: UpdatePermissionDto,
    userId: string,
  ): Promise<FilePermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
      relations: ['file', 'folder', 'user'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.file && permission.file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (permission.folder && permission.folder.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    const oldPermission = permission.permission;
    permission.permission = updateDto.permission;
    const savedPermission = await this.permissionRepository.save(permission);

    // Notify user about permission update
    if (permission.userId) {
      this.eventsGateway.notifyPermissionUpdated(
        permission.userId,
        savedPermission,
      );

      // Send email notification
      if (permission.user) {
        const owner = await this.userRepository.findOne({ where: { id: userId } });
        const resourceName = permission.file?.name || permission.folder?.name || 'Resource';
        const resourceType = permission.file ? 'file' : 'folder';

        try {
          await this.emailService.sendPermissionChangedNotification({
            recipientEmail: permission.user.email,
            recipientName: permission.user.email.split('@')[0],
            ownerName: owner?.email.split('@')[0] || 'Owner',
            resourceName,
            resourceType: resourceType as 'file' | 'folder',
            oldPermission,
            newPermission: updateDto.permission,
            accessUrl: `${this.baseUrl}/dashboard`,
          });
        } catch (error) {
          console.error('Failed to send permission changed email:', error);
        }
      }
    }

    return savedPermission;
  }

  async revokePermission(permissionId: string, userId: string): Promise<void> {
    const permission = await this.permissionRepository.findOne({
      where: { id: permissionId },
      relations: ['file', 'folder', 'user'],
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    if (permission.file && permission.file.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    if (permission.folder && permission.folder.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    // Get resource info before removing
    const resourceId = permission.fileId || permission.folderId;
    const resourceType = permission.fileId ? 'file' : 'folder';
    const affectedUserId = permission.userId;
    const resourceName = permission.file?.name || permission.folder?.name || 'Resource';
    const recipientEmail = permission.user?.email || permission.email;

    await this.permissionRepository.remove(permission);

    // Notify user about permission revocation
    if (affectedUserId && resourceId) {
      this.eventsGateway.notifyPermissionRevoked(
        affectedUserId,
        resourceId,
        resourceType as 'file' | 'folder',
      );
    }

    // Send email notification
    if (recipientEmail) {
      const owner = await this.userRepository.findOne({ where: { id: userId } });
      
      try {
        await this.emailService.sendAccessRevokedNotification({
          recipientEmail,
          recipientName: permission.user?.email.split('@')[0],
          ownerName: owner?.email.split('@')[0] || 'Owner',
          resourceName,
          resourceType: resourceType as 'file' | 'folder',
        });
      } catch (error) {
        console.error('Failed to send access revoked email:', error);
      }
    }
  }

  async generatePublicLink(
    resourceId: string,
    userId: string,
    type: 'file' | 'folder',
  ): Promise<{ publicLink: string; url: string; id: string; name: string }> {
    if (type === 'file') {
      const file = await this.fileRepository.findOne({
        where: { id: resourceId },
      });
      if (!file) {
        throw new NotFoundException('File not found');
      }
      if (file.ownerId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      file.isPublic = true;
      file.publicLink = file.publicLink || uuidv4();
      await this.fileRepository.save(file);

      const baseUrl = process.env['BASE_URL'] || 'http://localhost:5173';
      return {
        publicLink: file.publicLink,
        url: `${baseUrl}/public/${file.publicLink}?type=file`,
        id: file.id,
        name: file.name,
      };
    } else {
      const folder = await this.folderRepository.findOne({
        where: { id: resourceId },
      });
      if (!folder) {
        throw new NotFoundException('Folder not found');
      }
      if (folder.ownerId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      folder.isPublic = true;
      folder.publicLink = folder.publicLink || uuidv4();
      await this.folderRepository.save(folder);

      const baseUrl = process.env['BASE_URL'] || 'http://localhost:5173';
      return {
        publicLink: folder.publicLink,
        url: `${baseUrl}/public/${folder.publicLink}?type=folder`,
        id: folder.id,
        name: folder.name,
      };
    }
  }

  async getByPublicLink(
    publicLink: string,
    type: 'file' | 'folder',
  ): Promise<FileEntity | FolderEntity> {
    if (type === 'file') {
      const file = await this.fileRepository.findOne({
        where: { publicLink, isPublic: true },
        relations: ['owner'],
      });

      if (!file) {
        throw new NotFoundException('File not found or not public');
      }

      return file;
    } else {
      const folder = await this.folderRepository.findOne({
        where: { publicLink, isPublic: true },
        relations: ['owner', 'files', 'children'],
      });

      if (!folder) {
        throw new NotFoundException('Folder not found or not public');
      }

      return folder;
    }
  }
}
