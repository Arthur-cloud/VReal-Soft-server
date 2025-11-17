import { Module } from '@nestjs/common';
import { DataAccessUserModule } from '@db/data-access/data-access-user';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';

@Module({
  imports: [DataAccessUserModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
