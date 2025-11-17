import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileEntity } from '@db/data-access/data-access-file';
import { FolderEntity } from '@db/data-access/data-access-folder';
import { UpdateFileDto } from './dto/update-file.dto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { createReadStream, existsSync } from 'fs';
import { EventsGateway } from '@app/websocket';
import {
  FileNotFoundException,
  FolderNotFoundException,
  InsufficientPermissionsException,
  FileUploadFailedException,
  generateUniqueFilename,
  sanitizeFilename,
  generatePublicLink,
  FILE_UPLOAD_CONFIG,
  UploadedFile,
} from '@app/common';

/**
 * Service for managing file operations
 * Handles file upload, download, update, deletion, and search
 */
@Injectable()
export class FilesService {
  private readonly logger = new Logger(FilesService.name);
  private readonly uploadPath = FILE_UPLOAD_CONFIG.UPLOAD_DIR;

  constructor(
    @InjectRepository(FileEntity)
    private readonly fileRepository: Repository<FileEntity>,
    @InjectRepository(FolderEntity)
    private readonly folderRepository: Repository<FolderEntity>,
    private readonly eventsGateway: EventsGateway,
  ) {
    void this.ensureUploadDir();
  }

  /**
   * Ensure upload directory exists
   * Creates directory if it doesn't exist
   */
  private async ensureUploadDir(): Promise<void> {
    try {
      await fs.access(this.uploadPath);
    } catch {
      await fs.mkdir(this.uploadPath, { recursive: true });
      this.logger.log(`Created upload directory: ${this.uploadPath}`);
    }
  }

  /**
   * Validate file size
   * @param size - File size in bytes
   * @throws FileUploadFailedException if file exceeds maximum size
   */
  private validateFileSize(size: number): void {
    if (size > FILE_UPLOAD_CONFIG.MAX_SIZE_BYTES) {
      throw new FileUploadFailedException(
        `File size exceeds maximum allowed size of ${FILE_UPLOAD_CONFIG.MAX_SIZE_MB}MB`,
      );
    }
  }

  /**
   * Validate folder access
   * @param folderId - Folder ID to validate
   * @param userId - User ID requesting access
   * @returns Folder entity if valid
   * @throws FolderNotFoundException if folder doesn't exist
   * @throws InsufficientPermissionsException if user doesn't have access
   */
  private async validateFolderAccess(
    folderId: string,
    userId: string,
  ): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id: folderId },
    });

    if (!folder) {
      throw new FolderNotFoundException(folderId);
    }

    if (folder.ownerId !== userId) {
      throw new InsufficientPermissionsException('folder', 'view');
    }

    return folder;
  }

  /**
   * Save file to disk
   * @param buffer - File buffer
   * @param originalName - Original filename
   * @returns Saved filename
   * @throws FileUploadFailedException if save fails
   */
  private async saveFileToDisk(
    buffer: Buffer,
    originalName: string,
  ): Promise<string> {
    try {
      const sanitizedName = sanitizeFilename(originalName);
      const fileName = generateUniqueFilename(sanitizedName);
      const filePath = path.join(this.uploadPath, fileName);

      await fs.writeFile(filePath, buffer);
      this.logger.debug(`File saved to disk: ${fileName}`);

      return fileName;
    } catch (error) {
      this.logger.error(
        `Failed to save file to disk: ${(error as Error).message}`,
      );
      throw new FileUploadFailedException('Failed to save file to disk');
    }
  }

  /**
   * Upload a new file
   * @param file - Multer file object
   * @param userId - ID of user uploading file
   * @param folderId - Optional folder ID
   * @param isPublic - Whether file should be publicly accessible
   * @returns Created file entity
   * @throws FolderNotFoundException if folder doesn't exist
   * @throws InsufficientPermissionsException if user doesn't have folder access
   * @throws FileUploadFailedException if upload fails
   */
  async uploadFile(
    file: UploadedFile,
    userId: string,
    folderId?: string,
    isPublic = false,
  ): Promise<FileEntity> {
    this.logger.log(`Uploading file: ${file.originalname} for user: ${userId}`);

    // Validate file size
    this.validateFileSize(file.size);

    // Validate folder access if folderId provided
    if (folderId) {
      await this.validateFolderAccess(folderId, userId);
    }

    // Save file to disk
    const fileName = await this.saveFileToDisk(file.buffer, file.originalname);

    // Create file entity
    const fileEntity: Partial<FileEntity> = {
      name: file.originalname,
      path: fileName,
      size: file.size,
      mimeType: file.mimetype,
      ownerId: userId,
      folderId: folderId || undefined,
      isPublic,
      publicLink: isPublic ? generatePublicLink() : undefined,
    };

    const savedFile = await this.fileRepository.save(fileEntity);
    this.logger.log(`File uploaded successfully: ${savedFile.id}`);

    // WebSocket notification
    this.eventsGateway.notifyFileCreated(userId, savedFile);

    return savedFile;
  }

  /**
   * Get all files for user in specified folder
   * @param userId - User ID to filter files
   * @param folderId - Optional folder ID to filter by
   * @returns Array of file entities
   */
  async findAll(userId: string, folderId?: string): Promise<FileEntity[]> {
    const query = this.fileRepository.createQueryBuilder('file');

    query.where('file.ownerId = :userId', { userId });

    if (folderId) {
      query.andWhere('file.folderId = :folderId', { folderId });
    } else {
      query.andWhere('file.folderId IS NULL');
    }

    return query.getMany();
  }

  /**
   * Get a single file by ID
   * @param id - File ID
   * @param userId - User ID requesting access
   * @returns File entity
   * @throws FileNotFoundException if file doesn't exist
   * @throws InsufficientPermissionsException if user doesn't have access
   */
  async findOne(id: string, userId: string): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({
      where: { id },
      relations: ['owner', 'folder'],
    });

    if (!file) {
      throw new FileNotFoundException(id);
    }

    // Check permissions
    if (file.ownerId !== userId && !file.isPublic) {
      throw new InsufficientPermissionsException('file', 'view');
    }

    return file;
  }

  /**
   * Update file metadata
   * @param id - File ID
   * @param userId - User ID requesting update
   * @param updateFileDto - Updated file data
   * @returns Updated file entity
   * @throws FileNotFoundException if file doesn't exist
   * @throws InsufficientPermissionsException if user doesn't own file
   */
  async update(
    id: string,
    userId: string,
    updateFileDto: UpdateFileDto,
  ): Promise<FileEntity> {
    const file = await this.findOne(id, userId);

    if (file.ownerId !== userId) {
      throw new InsufficientPermissionsException('file', 'edit');
    }

    Object.assign(file, updateFileDto);
    const updatedFile = await this.fileRepository.save(file);

    this.logger.log(`File updated: ${id}`);
    return updatedFile;
  }

  /**
   * Delete a file
   * @param id - File ID
   * @param userId - User ID requesting deletion
   * @throws FileNotFoundException if file doesn't exist
   * @throws InsufficientPermissionsException if user doesn't own file
   */
  async remove(id: string, userId: string): Promise<void> {
    const file = await this.findOne(id, userId);

    if (file.ownerId !== userId) {
      throw new InsufficientPermissionsException('file', 'delete');
    }

    // Delete physical file
    const filePath = path.join(this.uploadPath, file.path);
    if (existsSync(filePath)) {
      await fs.unlink(filePath);
      this.logger.debug(`Deleted file from disk: ${filePath}`);
    }

    await this.fileRepository.remove(file);
    this.logger.log(`File removed: ${id}`);
  }

  /**
   * Clone an existing file
   * @param id - File ID to clone
   * @param userId - User ID requesting clone
   * @returns Cloned file entity
   * @throws FileNotFoundException if file doesn't exist
   * @throws InsufficientPermissionsException if user doesn't have access
   * @throws FileUploadFailedException if clone fails
   */
  async clone(id: string, userId: string): Promise<FileEntity> {
    this.logger.log(`Cloning file: ${id} for user: ${userId}`);
    const originalFile = await this.findOne(id, userId);

    try {
      const originalPath = path.join(this.uploadPath, originalFile.path);
      const fileExt = path.extname(originalFile.path);
      const newFileName = generateUniqueFilename(`copy${fileExt}`);
      const newFilePath = path.join(this.uploadPath, newFileName);

      await fs.copyFile(originalPath, newFilePath);

      const clonedFile = this.fileRepository.create({
        name: `${originalFile.name} (copy)`,
        path: newFileName,
        size: originalFile.size,
        mimeType: originalFile.mimeType,
        ownerId: userId,
        folderId: originalFile.folderId,
        isPublic: false,
      });

      const savedFile = await this.fileRepository.save(clonedFile);
      this.logger.log(`File cloned successfully: ${savedFile.id}`);

      return savedFile;
    } catch (error) {
      this.logger.error(`Failed to clone file: ${(error as Error).message}`);
      throw new FileUploadFailedException('Failed to clone file');
    }
  }

  /**
   * Get file stream for download
   * @param id - File ID
   * @param userId - User ID requesting download
   * @returns File stream and file entity
   * @throws FileNotFoundException if file doesn't exist or not on disk
   * @throws InsufficientPermissionsException if user doesn't have access
   */
  async getFileStream(id: string, userId: string) {
    const file = await this.findOne(id, userId);
    const filePath = path.join(this.uploadPath, file.path);

    if (!existsSync(filePath)) {
      throw new FileNotFoundException(`${id} (file not found on disk)`);
    }

    return {
      stream: createReadStream(filePath),
      file,
    };
  }

  /**
   * Search files by name
   * @param userId - User ID to filter files
   * @param query - Search query
   * @returns Array of matching file entities
   */
  async search(userId: string, query: string): Promise<FileEntity[]> {
    this.logger.debug(`Searching files for user: ${userId}, query: ${query}`);

    return this.fileRepository
      .createQueryBuilder('file')
      .where('file.ownerId = :userId', { userId })
      .andWhere('file.name ILIKE :query', { query: `%${query}%` })
      .getMany();
  }
}
