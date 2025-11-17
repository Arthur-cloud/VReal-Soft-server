export enum WebSocketEvent {
  // File events
  FILE_CREATED = 'file:created',
  FILE_UPDATED = 'file:updated',
  FILE_DELETED = 'file:deleted',
  FILE_SHARED = 'file:shared',

  // Folder events
  FOLDER_CREATED = 'folder:created',
  FOLDER_UPDATED = 'folder:updated',
  FOLDER_DELETED = 'folder:deleted',
  FOLDER_SHARED = 'folder:shared',

  // Permission events
  PERMISSION_GRANTED = 'permission:granted',
  PERMISSION_REVOKED = 'permission:revoked',
  PERMISSION_UPDATED = 'permission:updated',
}
