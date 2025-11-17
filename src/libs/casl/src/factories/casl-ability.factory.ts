import {
  AbilityBuilder,
  AbilityClass,
  ExtractSubjectType,
} from '@casl/ability';
import { Injectable } from '@nestjs/common';
import { Action } from '../enums/casl-action.enum';
import { Permission } from '@app/common';
import { AppAbility, Subjects } from '../types/casl.types';
import { Ability } from '@casl/ability';
import { UserEntity } from '@db/data-access/data-access-user';
import { FileEntity } from '@db/data-access/data-access-file';
import { FilePermissionEntity } from '@db/data-access/data-access-file-permission';
import { FolderEntity } from '@db/data-access/data-access-folder';

@Injectable()
export class CaslAbilityFactory {
  createForUser(
    user: UserEntity,
    permissions: FilePermissionEntity[] = [],
  ): AppAbility {
    const { can, build } = new AbilityBuilder<AppAbility>(
      Ability as AbilityClass<AppAbility>,
    );

    // Owner has full access to their own resources
    can(Action.Manage, FileEntity, { ownerId: user.id });
    can(Action.Manage, FolderEntity, { ownerId: user.id });

    // Public resources are readable by everyone
    can(Action.Read, FileEntity, { isPublic: true });
    can(Action.Read, FolderEntity, { isPublic: true });

    // Apply shared permissions
    this.applySharedPermissions(can, permissions, user);

    return build({
      detectSubjectType: (item) =>
        item.constructor as ExtractSubjectType<Subjects>,
    });
  }

  private applySharedPermissions(
    can: any,
    permissions: FilePermissionEntity[],
    user: UserEntity,
  ): void {
    const userPermissions = permissions.filter(
      (perm) => perm.userId === user.id || perm.email === user.email,
    );

    userPermissions.forEach((perm) => {
      const actions = this.getActionsForPermission(perm.permission);
      const resourceType = perm.fileId ? FileEntity : FolderEntity;
      const resourceId = perm.fileId || perm.folderId;

      if (resourceId) {
        can(actions, resourceType, { id: resourceId });
      }
    });
  }

  private getActionsForPermission(permission: Permission): Action[] {
    const permissionMap: Record<Permission, Action[]> = {
      [Permission.VIEW]: [Action.Read],
      [Permission.EDIT]: [Action.Read, Action.Update],
      [Permission.DELETE]: [Action.Read, Action.Update, Action.Delete],
      [Permission.SHARE]: [Action.Read, Action.Update, Action.Share],
      [Permission.MANAGE]: [Action.Manage],
    };

    return permissionMap[permission] || [];
  }
}
