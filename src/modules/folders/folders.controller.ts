import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { FoldersService } from './folders.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '@db/data-access/data-access-user';

@ApiTags('folders')
@ApiBearerAuth()
@Controller('folders')
@UseGuards(JwtAccessGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new folder' })
  @ApiResponse({
    status: 201,
    description: 'Folder created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Documents',
        isPublic: false,
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        parentId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Circular dependency detected' })
  create(
    @Body() createFolderDto: CreateFolderDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.foldersService.create(createFolderDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all folders' })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'Filter folders by parent folder ID',
  })
  @ApiResponse({
    status: 200,
    description: 'List of folders',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Documents',
          isPublic: false,
          parentId: null,
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(
    @CurrentUser() user: UserEntity,
    @Query('parentId') parentId?: string,
  ) {
    return this.foldersService.findAll(user.id, parentId);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search folders by name' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          name: 'Documents',
          isPublic: false,
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  search(@CurrentUser() user: UserEntity, @Query('q') query: string) {
    return this.foldersService.search(user.id, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get folder by ID' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder details with children and files',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Documents',
        isPublic: false,
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        parentId: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        children: [],
        files: [],
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  findOne(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.foldersService.findOne(id, user.id);
  }

  @Post(':id/clone')
  @ApiOperation({ summary: 'Clone a folder recursively' })
  @ApiParam({ name: 'id', description: 'Folder ID to clone' })
  @ApiResponse({
    status: 201,
    description: 'Folder cloned successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Documents (copy)',
        isPublic: false,
        ownerId: '550e8400-e29b-41d4-a716-446655440001',
        createdAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  clone(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.foldersService.clone(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update folder metadata' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({
    status: 200,
    description: 'Folder updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'My Documents',
        isPublic: true,
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  @ApiResponse({ status: 400, description: 'Circular dependency detected' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
    @Body() updateFolderDto: UpdateFolderDto,
  ) {
    return this.foldersService.update(id, user.id, updateFolderDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a folder and its contents' })
  @ApiParam({ name: 'id', description: 'Folder ID' })
  @ApiResponse({ status: 200, description: 'Folder deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Folder not found' })
  remove(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.foldersService.remove(id, user.id);
  }
}
