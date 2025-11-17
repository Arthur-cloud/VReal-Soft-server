import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { FilesService } from './files.service';
import { UpdateFileDto } from './dto/update-file.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '@db/data-access/data-access-user';

@ApiTags('files')
@ApiBearerAuth()
@Controller('files')
@UseGuards(JwtAccessGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'File to upload',
        },
        folderId: {
          type: 'string',
          format: 'uuid',
          description: 'Optional parent folder ID',
        },
        isPublic: {
          type: 'boolean',
          description: 'Whether the file should be public',
        },
      },
      required: ['file'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'File uploaded successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'document.pdf',
        path: 'uploads/550e8400-e29b-41d4-a716-446655440000.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        isPublic: false,
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        folderId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: UserEntity,
    @Body('folderId') folderId?: string,
    @Body('isPublic') isPublic?: boolean,
  ) {
    return this.filesService.uploadFile(file, user.id, folderId, isPublic);
  }

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  @ApiQuery({
    name: 'folderId',
    required: false,
    description: 'Filter files by folder ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of files',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'document.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
          isPublic: false,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUser() user: UserEntity,
    @Query('folderId') folderId?: string,
  ) {
    return this.filesService.findAll(user.id, folderId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search files by name' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'document.pdf',
          size: 1024000,
          mimeType: 'application/pdf',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  search(@CurrentUser() user: UserEntity, @Query('q') query: string) {
    return this.filesService.search(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File details',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'document.pdf',
        path: 'uploads/550e8400-e29b-41d4-a716-446655440000.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        isPublic: false,
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        folderId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.filesService.findOne(id, user.id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download a file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File download stream',
    content: {
      'application/octet-stream': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  async downloadFile(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { stream, file } = await this.filesService.getFileStream(id, user.id);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.name}"`,
    });

    return new StreamableFile(stream);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a file' })
  @ApiParam({ name: 'id', description: 'File ID to clone' })
  @ApiResponse({
    status: 201,
    description: 'File cloned successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'document (copy).pdf',
        path: 'uploads/550e8400-e29b-41d4-a716-446655440002.pdf',
        size: 1024000,
        mimeType: 'application/pdf',
        isPublic: false,
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  clone(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.filesService.clone(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update file metadata' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({
    status: 200,
    description: 'File updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'renamed-document.pdf',
        isPublic: true,
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Body() updateFileDto: UpdateFileDto,
  ) {
    return this.filesService.update(id, user.id, updateFileDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a file' })
  @ApiParam({ name: 'id', description: 'File ID' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'File not found' })
  remove(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.filesService.remove(id, user.id);
  }
}
