import { IsString, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFileDto {
  @ApiProperty({
    example: 'document.pdf',
    description: 'New file name',
    required: false,
  })
  @IsOptional()
  @IsString()
  declare name?: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'New parent folder ID',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  declare folderId?: string;

  @ApiProperty({
    example: true,
    description: 'Update public accessibility',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  declare isPublic?: boolean;
}
