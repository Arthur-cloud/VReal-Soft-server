import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FolderEntity } from './entities/folder.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FolderEntity])],
  exports: [TypeOrmModule],
})
export class DataAccessFolderModule {}