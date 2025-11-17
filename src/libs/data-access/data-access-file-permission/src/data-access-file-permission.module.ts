import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilePermissionEntity } from './entities/file-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FilePermissionEntity])],
  exports: [TypeOrmModule],
})
export class DataAccessFilePermissionModule {}
