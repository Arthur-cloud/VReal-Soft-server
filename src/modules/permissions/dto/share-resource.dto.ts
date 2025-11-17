import { IsEmail, IsEnum, IsUUID, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '@app/common';

export class ShareResourceDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the file to share (either fileId or folderId required)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  declare fileId?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description:
      'ID of the folder to share (either fileId or folderId required)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  declare folderId?: string;

  @ApiProperty({
    example: 'recipient@example.com',
    description: 'Email address of the user to share with',
  })
  @IsEmail()
  declare email: string;

  @ApiProperty({
    example: Permission.VIEW,
    description: 'Permission level to grant',
    enum: Permission,
  })
  @IsEnum(Permission)
  declare permission: Permission;
}
