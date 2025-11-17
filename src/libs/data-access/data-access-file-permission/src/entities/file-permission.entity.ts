import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { FolderEntity } from '@db/data-access/data-access-folder';
import { UserEntity } from '@db/data-access/data-access-user';
import { FileEntity } from '@db/data-access/data-access-file';
import { Permission } from '@app/common';
import { BasicEntity } from '@db/data-access/database';

@Entity('file_permissions')
export class FilePermissionEntity extends BasicEntity {
  @Column({ nullable: true })
  declare fileId: string;

  @ManyToOne(() => FileEntity, (file) => file.permissions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'fileId' })
  declare file: FileEntity;

  @Column({ nullable: true })
  declare folderId: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.permissions, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'folderId' })
  declare folder: FolderEntity;

  @Column({ nullable: true })
  declare userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'userId' })
  declare user: UserEntity;

  @Column({ nullable: true })
  declare email: string;

  @Column({
    type: 'enum',
    enum: Permission,
    default: Permission.VIEW,
  })
  declare permission: Permission;
}
