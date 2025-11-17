import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';

/**
 * Exception thrown when a user already exists
 */
export class UserAlreadyExistsException extends ConflictException {
  constructor(email: string) {
    super(`User with email "${email}" already exists`);
  }
}

/**
 * Exception thrown when invalid credentials are provided
 */
export class InvalidCredentialsException extends BadRequestException {
  constructor() {
    super('Invalid email or password');
  }
}

/**
 * Exception thrown when a user is not found
 */
export class UserNotFoundException extends NotFoundException {
  constructor(identifier: string) {
    super(`User "${identifier}" not found`);
  }
}

/**
 * Exception thrown when a file is not found
 */
export class FileNotFoundException extends NotFoundException {
  constructor(fileId: string) {
    super(`File with ID "${fileId}" not found`);
  }
}

/**
 * Exception thrown when a folder is not found
 */
export class FolderNotFoundException extends NotFoundException {
  constructor(folderId: string) {
    super(`Folder with ID "${folderId}" not found`);
  }
}

/**
 * Exception thrown when trying to create a circular folder dependency
 */
export class CircularDependencyException extends BadRequestException {
  constructor() {
    super(
      'Circular folder dependency detected. A folder cannot be its own parent.',
    );
  }
}

/**
 * Exception thrown when user lacks permission to perform an action
 */
export class InsufficientPermissionsException extends ForbiddenException {
  constructor(action: string, resource: string) {
    super(`You don't have permission to ${action} this ${resource}`);
  }
}

/**
 * Exception thrown when a permission is not found
 */
export class PermissionNotFoundException extends NotFoundException {
  constructor(permissionId: string) {
    super(`Permission with ID "${permissionId}" not found`);
  }
}

/**
 * Exception thrown when file upload fails
 */
export class FileUploadFailedException extends BadRequestException {
  constructor(reason?: string) {
    super(reason ? `File upload failed: ${reason}` : 'File upload failed');
  }
}
