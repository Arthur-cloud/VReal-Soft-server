import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@app/common';

export class UpdatePermissionDto {
  @ApiProperty({
    example: Permission.EDIT,
    description: 'New permission level',
    enum: Permission,
  })
  @IsEnum(Permission)
  declare permission: Permission;
}
