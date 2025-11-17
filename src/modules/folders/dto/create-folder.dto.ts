import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({
    example: 'Documents',
    description: 'Folder name',
  })
  @IsString()
  declare name: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the parent folder (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  declare parentId?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the folder should be publicly accessible',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  declare isPublic?: boolean;
}
