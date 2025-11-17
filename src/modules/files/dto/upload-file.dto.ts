import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadFileDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'ID of the parent folder (optional)',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  declare folderId?: string;

  @ApiProperty({
    example: false,
    description: 'Whether the file should be publicly accessible',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  declare isPublic?: boolean;
}
