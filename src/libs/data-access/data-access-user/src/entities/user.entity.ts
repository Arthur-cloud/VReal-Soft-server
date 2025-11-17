import { FileEntity } from '@db/data-access/data-access-file';
import { FolderEntity } from '@db/data-access/data-access-folder';
import { BasicEntity } from '@db/data-access/database';
import {
  Entity,
  Column,
  OneToMany,
} from 'typeorm';

@Entity('users')
export class UserEntity extends BasicEntity {
  @Column({ unique: true })
  declare email: string;

  @Column()
  declare password: string;

  @Column({ nullable: true })
  declare refreshToken: string;

  @OneToMany(() => FileEntity, (file) => file.owner)
  declare files: FileEntity[];

  @OneToMany(() => FolderEntity, (folder) => folder.owner)
  declare folders: FolderEntity[];
}
