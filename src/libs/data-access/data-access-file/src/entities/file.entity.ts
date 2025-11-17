import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '@db/data-access/data-access-user';
import { FolderEntity } from '@db/data-access/data-access-folder';
import { FilePermissionEntity } from '@db/data-access/data-access-file-permission';
import { BasicEntity } from '@db/data-access/database';

@Entity('files')
export class FileEntity extends BasicEntity {
  @Column()
  declare name: string;

  @Column()
  declare path: string;

  @Column({ type: 'bigint' })
  declare size: number;

  @Column()
  declare mimeType: string;

  @Column()
  declare ownerId: string;

  @ManyToOne(() => UserEntity, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  declare owner: UserEntity;

  @Column({ nullable: true })
  declare folderId: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.files, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'folderId' })
  declare folder: FolderEntity;

  @OneToMany(() => FilePermissionEntity, (permission) => permission.file)
  declare permissions: FilePermissionEntity[];

  @Column({ default: false })
  declare isPublic: boolean;

  @Column({ nullable: true })
  declare publicLink: string;
}
