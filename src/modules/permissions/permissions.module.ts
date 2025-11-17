import { Module } from '@nestjs/common';
import { DataAccessFilePermissionModule } from '@db/data-access/data-access-file-permission';
import { DataAccessFileModule } from '@db/data-access/data-access-file';
import { DataAccessFolderModule } from '@db/data-access/data-access-folder';
import { DataAccessUserModule } from '@db/data-access/data-access-user';
import { WebsocketModule } from '@app/websocket';
import { EmailModule } from '@app/email';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';

@Module({
  imports: [
    DataAccessFilePermissionModule,
    DataAccessFileModule,
    DataAccessFolderModule,
    DataAccessUserModule,
    WebsocketModule,
    EmailModule,
  ],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [PermissionsService],
})
export class PermissionsModule {}
