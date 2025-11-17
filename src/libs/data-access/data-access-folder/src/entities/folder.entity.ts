import { FileEntity } from '@db/data-access/data-access-file';
import { UserEntity } from '@db/data-access/data-access-user';
import { FilePermissionEntity } from '@db/data-access/data-access-file-permission';
import {
  Entity,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BasicEntity } from '@db/data-access/database';

@Entity('folders')
export class FolderEntity extends BasicEntity {
  @Column()
  declare name: string;

  @Column({ nullable: true })
  declare parentId: string;

  @ManyToOne(() => FolderEntity, (folder) => folder.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parentId' })
  declare parent: FolderEntity;

  @OneToMany(() => FolderEntity, (folder) => folder.parent)
  declare children: FolderEntity[];

  @Column()
  declare ownerId: string;

  @ManyToOne(() => UserEntity, (user) => user.folders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ownerId' })
  declare owner: UserEntity;

  @OneToMany(() => FileEntity, (file) => file.folder)
  declare files: FileEntity[];

  @OneToMany(() => FilePermissionEntity, (permission) => permission.folder)
  declare permissions: FilePermissionEntity[];

  @Column({ default: false })
  declare isPublic: boolean;

  @Column({ nullable: true })
  declare publicLink: string;
}
