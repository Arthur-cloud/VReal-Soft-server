import { Permission } from '@app/common';

// Base interfaces
export interface ResourcePayload {
  id: string;
  name: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilePayload extends ResourcePayload {
  path: string;
  size: number;
  mimeType: string;
  folderId?: string;
  isPublic: boolean;
  publicLink?: string;
}

export interface FolderPayload extends ResourcePayload {
  parentId?: string;
  isPublic: boolean;
  publicLink?: string;
}

export interface PermissionPayload {
  id: string;
  fileId?: string;
  folderId?: string;
  userId?: string;
  email?: string;
  permission: Permission;
  createdAt: Date;
}

// Event-specific payloads
export interface FileCreatedPayload {
  file: FilePayload;
}

export interface FileUpdatedPayload {
  file: FilePayload;
}

export interface FileDeletedPayload {
  id: string;
}

export interface FileSharedPayload {
  file: FilePayload;
  sharedWith: string;
  permission: PermissionPayload;
}

export interface FolderCreatedPayload {
  folder: FolderPayload;
}

export interface FolderUpdatedPayload {
  folder: FolderPayload;
}

export interface FolderDeletedPayload {
  id: string;
}

export interface FolderSharedPayload {
  folder: FolderPayload;
  sharedWith: string;
  permission: PermissionPayload;
}

export interface PermissionGrantedPayload {
  file?: FilePayload;
  folder?: FolderPayload;
  permission: PermissionPayload;
}

export interface PermissionRevokedPayload {
  resourceId: string;
  resourceType: 'file' | 'folder';
}

export interface PermissionUpdatedPayload {
  permission: PermissionPayload;
}

// WebSocket event map for type-safety
export interface WebSocketEventMap {
  'file:created': FileCreatedPayload;
  'file:updated': FileUpdatedPayload;
  'file:deleted': FileDeletedPayload;
  'file:shared': FileSharedPayload;
  'folder:created': FolderCreatedPayload;
  'folder:updated': FolderUpdatedPayload;
  'folder:deleted': FolderDeletedPayload;
  'folder:shared': FolderSharedPayload;
  'permission:granted': PermissionGrantedPayload;
  'permission:revoked': PermissionRevokedPayload;
  'permission:updated': PermissionUpdatedPayload;
}
