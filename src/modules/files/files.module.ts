import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { DataAccessFileModule } from '@db/data-access/data-access-file';
import { DataAccessFolderModule } from '@db/data-access/data-access-folder';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { WebsocketModule } from '@app/websocket';

@Module({
  imports: [
    DataAccessFileModule,
    DataAccessFolderModule,
    MulterModule.register({
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB
      },
    }),
    WebsocketModule,
  ],
  controllers: [FilesController],
  providers: [FilesService],
  exports: [FilesService],
})
export class FilesModule {}
