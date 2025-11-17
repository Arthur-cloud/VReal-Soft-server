import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
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
import { PermissionsService } from './permissions.service';
import { ShareResourceDto } from './dto/share-resource.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserEntity } from '@db/data-access/data-access-user';

@ApiTags('permissions')
@ApiBearerAuth()
@Controller('permissions')
@UseGuards(JwtAccessGuard)
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('share')
  @ApiOperation({ summary: 'Share a file or folder with another user' })
  @ApiResponse({
    status: 201,
    description: 'Resource shared successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        fileId: '550e8400-e29b-41d4-a716-446655440001',
        folderId: null,
        userId: null,
        email: 'recipient@example.com',
        permission: 'view',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  shareResource(@Body() shareDto: ShareResourceDto, @CurrentUser() user: UserEntity) {
    return this.permissionsService.shareResource(shareDto, user.id);
  }

  @Get('my-permissions')
  @ApiOperation({ summary: 'Get all permissions granted to current user' })
  @ApiResponse({
    status: 200,
    description: 'List of permissions',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          fileId: '550e8400-e29b-41d4-a716-446655440001',
          folderId: null,
          permission: 'edit',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getMyPermissions(@CurrentUser() user: UserEntity) {
    return this.permissionsService.getUserPermissions(user.id);
  }

  @Get('resource/:resourceId')
  @ApiOperation({ summary: 'Get all permissions for a specific resource' })
  @ApiParam({ name: 'resourceId', description: 'File or folder ID' })
  @ApiQuery({
    name: 'type',
    enum: ['file', 'folder'],
    description: 'Resource type',
  })
  @ApiResponse({
    status: 200,
    description: 'List of permissions for the resource',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          email: 'user1@example.com',
          permission: 'view',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          email: 'user2@example.com',
          permission: 'edit',
          createdAt: '2024-01-01T00:00:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  getResourcePermissions(
    @Param('resourceId') resourceId: string,
    @CurrentUser() user: UserEntity,
    @Query('type') type: 'file' | 'folder',
  ) {
    return this.permissionsService.getResourcePermissions(
      resourceId,
      user.id,
      type,
    );
  }

  @Post('public-link/:resourceId')
  @ApiOperation({ summary: 'Generate a public link for a resource' })
  @ApiParam({ name: 'resourceId', description: 'File or folder ID' })
  @ApiQuery({
    name: 'type',
    enum: ['file', 'folder'],
    description: 'Resource type',
  })
  @ApiResponse({
    status: 201,
    description: 'Public link generated successfully',
    schema: {
      example: {
        publicLink: 'abc123def456ghi789jkl012',
        url: 'http://localhost:3000/api/permissions/public/abc123def456ghi789jkl012?type=file',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Resource not found' })
  generatePublicLink(
    @Param('resourceId') resourceId: string,
    @CurrentUser() user: UserEntity,
    @Query('type') type: 'file' | 'folder',
  ) {
    return this.permissionsService.generatePublicLink(
      resourceId,
      user.id,
      type,
    );
  }

  @Get('public/:publicLink')
  @ApiOperation({ summary: 'Access a resource via public link' })
  @ApiParam({ name: 'publicLink', description: 'Public link token' })
  @ApiQuery({
    name: 'type',
    enum: ['file', 'folder'],
    description: 'Resource type',
  })
  @ApiResponse({
    status: 200,
    description: 'Resource data',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'document.pdf',
        isPublic: true,
        publicLink: 'abc123def456ghi789jkl012',
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Resource not found or not public' })
  getByPublicLink(
    @Param('publicLink') publicLink: string,
    @Query('type') type: 'file' | 'folder',
  ) {
    return this.permissionsService.getByPublicLink(publicLink, type);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update permission level' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        permission: 'manage',
        updatedAt: '2024-01-01T00:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  updatePermission(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto,
    @CurrentUser() user: UserEntity,
  ) {
    return this.permissionsService.updatePermission(id, updateDto, user.id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a permission' })
  @ApiParam({ name: 'id', description: 'Permission ID' })
  @ApiResponse({ status: 200, description: 'Permission revoked successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Permission not found' })
  revokePermission(@Param('id') id: string, @CurrentUser() user: UserEntity) {
    return this.permissionsService.revokePermission(id, user.id);
  }
}

