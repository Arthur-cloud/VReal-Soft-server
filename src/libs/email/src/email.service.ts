import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

export interface ShareNotificationData {
  recipientEmail: string;
  recipientName?: string;
  ownerName: string;
  resourceName: string;
  resourceType: 'file' | 'folder';
  permission: string;
  accessUrl: string;
}

export interface InviteNotificationData {
  recipientEmail: string;
  ownerName: string;
  resourceName: string;
  resourceType: 'file' | 'folder';
  permission: string;
  signupUrl: string;
  accessUrl: string;
}

export interface PermissionChangedData {
  recipientEmail: string;
  recipientName?: string;
  ownerName: string;
  resourceName: string;
  resourceType: 'file' | 'folder';
  oldPermission: string;
  newPermission: string;
  accessUrl: string;
}

export interface AccessRevokedData {
  recipientEmail: string;
  recipientName?: string;
  ownerName: string;
  resourceName: string;
  resourceType: 'file' | 'folder';
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly baseUrl: string;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:5173');
  }

  async sendShareNotification(data: ShareNotificationData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `${data.ownerName} shared a ${data.resourceType} with you`,
        template: './share-notification',
        context: {
          recipientName: data.recipientName || data.recipientEmail.split('@')[0],
          ownerName: data.ownerName,
          resourceName: data.resourceName,
          resourceType: data.resourceType,
          permission: this.getPermissionLabel(data.permission),
          permissionDescription: this.getPermissionDescription(data.permission),
          accessUrl: data.accessUrl,
          baseUrl: this.baseUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Share notification sent to ${data.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send share notification to ${data.recipientEmail}`, error);
      throw error;
    }
  }

  async sendInviteNotification(data: InviteNotificationData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `${data.ownerName} invited you to VReal`,
        template: './invite-notification',
        context: {
          ownerName: data.ownerName,
          resourceName: data.resourceName,
          resourceType: data.resourceType,
          permission: this.getPermissionLabel(data.permission),
          permissionDescription: this.getPermissionDescription(data.permission),
          signupUrl: data.signupUrl,
          accessUrl: data.accessUrl,
          baseUrl: this.baseUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Invite notification sent to ${data.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send invite notification to ${data.recipientEmail}`, error);
      throw error;
    }
  }

  async sendPermissionChangedNotification(data: PermissionChangedData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `Your access to "${data.resourceName}" has been updated`,
        template: './permission-changed',
        context: {
          recipientName: data.recipientName || data.recipientEmail.split('@')[0],
          ownerName: data.ownerName,
          resourceName: data.resourceName,
          resourceType: data.resourceType,
          oldPermission: this.getPermissionLabel(data.oldPermission),
          newPermission: this.getPermissionLabel(data.newPermission),
          permissionDescription: this.getPermissionDescription(data.newPermission),
          accessUrl: data.accessUrl,
          baseUrl: this.baseUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Permission changed notification sent to ${data.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send permission changed notification to ${data.recipientEmail}`, error);
      throw error;
    }
  }

  async sendAccessRevokedNotification(data: AccessRevokedData): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: data.recipientEmail,
        subject: `Your access to "${data.resourceName}" has been revoked`,
        template: './access-revoked',
        context: {
          recipientName: data.recipientName || data.recipientEmail.split('@')[0],
          ownerName: data.ownerName,
          resourceName: data.resourceName,
          resourceType: data.resourceType,
          baseUrl: this.baseUrl,
          year: new Date().getFullYear(),
        },
      });

      this.logger.log(`Access revoked notification sent to ${data.recipientEmail}`);
    } catch (error) {
      this.logger.error(`Failed to send access revoked notification to ${data.recipientEmail}`, error);
      throw error;
    }
  }

  private getPermissionLabel(permission: string): string {
    const labels: Record<string, string> = {
      view: 'View Only',
      edit: 'Can Edit',
      delete: 'Can Delete',
      share: 'Can Share',
      manage: 'Full Access',
    };
    return labels[permission] || permission;
  }

  private getPermissionDescription(permission: string): string {
    const descriptions: Record<string, string> = {
      view: 'You can view and download this resource',
      edit: 'You can view, download, and edit this resource',
      delete: 'You can view, download, edit, and delete this resource',
      share: 'You can view, download, edit, delete, and share this resource with others',
      manage: 'You have full access to manage this resource and its permissions',
    };
    return descriptions[permission] || 'You have access to this resource';
  }
}
