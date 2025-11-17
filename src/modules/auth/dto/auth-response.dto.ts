import { BasicEntityDto } from '@db/data-access/database';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto extends BasicEntityDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'User email address',
  })
  declare email: string;
}

export class TokensResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token (valid for 15 minutes)',
  })
  declare accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT refresh token (valid for 7 days)',
  })
  declare refreshToken: string;
}

export class AuthResponseDto extends TokensResponseDto {
  @ApiProperty({
    type: UserResponseDto,
    description: 'Authenticated user information',
  })
  declare user: UserResponseDto;
}
