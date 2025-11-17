import { Module } from '@nestjs/common';
import { DataAccessFolderModule } from '@db/data-access/data-access-folder';
import { FoldersService } from './folders.service';
import { FoldersController } from './folders.controller';
import { WebsocketModule } from '@app/websocket';

@Module({
  imports: [DataAccessFolderModule, WebsocketModule],
  controllers: [FoldersController],
  providers: [FoldersService],
  exports: [FoldersService],
})
export class FoldersModule {}
