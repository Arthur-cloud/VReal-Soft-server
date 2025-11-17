import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FolderEntity } from '@db/data-access/data-access-folder';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { v4 as uuidv4 } from 'uuid';
import { EventsGateway } from '@app/websocket';

@Injectable()
export class FoldersService {
  constructor(
    @InjectRepository(FolderEntity)
    private folderRepository: Repository<FolderEntity>,
    private eventsGateway: EventsGateway,
  ) {}

  async create(
    createFolderDto: CreateFolderDto,
    userId: string,
  ): Promise<FolderEntity> {
    const { name, parentId, isPublic } = createFolderDto;

    if (parentId) {
      const parentFolder = await this.folderRepository.findOne({
        where: { id: parentId },
      });

      if (!parentFolder) {
        throw new NotFoundException('Parent folder not found');
      }

      if (parentFolder.ownerId !== userId) {
        throw new ForbiddenException(
          'You do not have access to this parent folder',
        );
      }
    }

    const folderData: Partial<FolderEntity> = {
      name,
      parentId: parentId || undefined,
      ownerId: userId,
      isPublic: isPublic || false,
      publicLink: isPublic ? uuidv4() : undefined,
    };

    const savedFolder = await this.folderRepository.save(folderData);

    // WebSocket notification
    this.eventsGateway.notifyFolderCreated(userId, savedFolder);

    return savedFolder;
  }

  async findAll(userId: string, parentId?: string): Promise<FolderEntity[]> {
    const query = this.folderRepository.createQueryBuilder('folder');

    query.where('folder.ownerId = :userId', { userId });

    if (parentId) {
      query.andWhere('folder.parentId = :parentId', { parentId });
    } else {
      query.andWhere('folder.parentId IS NULL');
    }

    return query.getMany();
  }

  async findOne(id: string, userId: string): Promise<FolderEntity> {
    const folder = await this.folderRepository.findOne({
      where: { id },
      relations: ['owner', 'parent', 'children', 'files'],
    });

    if (!folder) {
      throw new NotFoundException('Folder not found');
    }

    // TODO: Перевірка permissions через CASL
    if (folder.ownerId !== userId && !folder.isPublic) {
      throw new ForbiddenException('You do not have access to this folder');
    }

    return folder;
  }

  async update(
    id: string,
    userId: string,
    updateFolderDto: UpdateFolderDto,
  ): Promise<FolderEntity> {
    const folder = await this.findOne(id, userId);

    if (folder.ownerId !== userId) {
      throw new ForbiddenException('You can only update your own folders');
    }

    if (updateFolderDto.parentId) {
      await this.checkCircularDependency(id, updateFolderDto.parentId);
    }

    Object.assign(folder, updateFolderDto);
    return this.folderRepository.save(folder);
  }

  async remove(id: string, userId: string): Promise<void> {
    const folder = await this.findOne(id, userId);

    if (folder.ownerId !== userId) {
      throw new ForbiddenException('You can only delete your own folders');
    }

    await this.folderRepository.remove(folder);
  }

  async clone(id: string, userId: string): Promise<FolderEntity> {
    const originalFolder = await this.findOne(id, userId);

    const clonedFolder = this.folderRepository.create({
      name: `${originalFolder.name} (copy)`,
      parentId: originalFolder.parentId,
      ownerId: userId,
      isPublic: false,
    });

    return this.folderRepository.save(clonedFolder);
  }

  async search(userId: string, query: string): Promise<FolderEntity[]> {
    return this.folderRepository
      .createQueryBuilder('folder')
      .where('folder.ownerId = :userId', { userId })
      .andWhere('folder.name ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  private async checkCircularDependency(
    folderId: string,
    newParentId: string,
  ): Promise<void> {
    if (folderId === newParentId) {
      throw new BadRequestException('Folder cannot be its own parent');
    }

    let currentParentId = newParentId;

    while (currentParentId) {
      if (currentParentId === folderId) {
        throw new BadRequestException(
          'Circular dependency detected: folder cannot be moved into its own descendant',
        );
      }

      const parentFolder = await this.folderRepository.findOne({
        where: { id: currentParentId },
      });

      if (!parentFolder) break;
      currentParentId = parentFolder.parentId;
    }
  }
}
