import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '@db/data-access/data-access-user';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  AuthResponseDto,
  TokensResponseDto,
  UserResponseDto,
} from './dto/auth-response.dto';
import {
  UserAlreadyExistsException,
  InvalidCredentialsException,
  JWT_CONFIG,
} from '@app/common';

/**
 * Service responsible for authentication and authorization
 * Handles user registration, login, token generation and refresh
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new user
   * @param registerDto - User registration data
   * @returns Authentication response with tokens and user data
   * @throws UserAlreadyExistsException if email is already taken
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password } = registerDto;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new UserAlreadyExistsException(email);
    }

    const hashedPassword = await this.hashPassword(password);

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
    });

    await this.userRepository.save(user);
    this.logger.log(`New user registered: ${email}`);

    const tokens = this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.mapToUserResponse(user),
    };
  }

  /**
   * Authenticate user with email and password
   * @param loginDto - User login credentials
   * @returns Authentication response with tokens and user data
   * @throws InvalidCredentialsException if credentials are invalid
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new InvalidCredentialsException();
    }

    const isPasswordValid = await this.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      throw new InvalidCredentialsException();
    }

    this.logger.log(`User logged in: ${email}`);

    const tokens = this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return {
      ...tokens,
      user: this.mapToUserResponse(user),
    };
  }

  /**
   * Refresh access and refresh tokens
   * @param userId - User ID from refresh token
   * @param refreshToken - Current refresh token
   * @returns New token pair
   * @throws UnauthorizedException if refresh token is invalid
   */
  async refreshTokens(
    userId: string,
    refreshToken: string,
  ): Promise<TokensResponseDto> {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const refreshTokenMatches = await this.verifyPassword(
      refreshToken,
      user.refreshToken,
    );

    if (!refreshTokenMatches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

  /**
   * Logout user by invalidating refresh token
   * @param userId - User ID to logout
   */
  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: undefined });
    this.logger.log(`User logged out: ${userId}`);
  }

  /**
   * Generate JWT access and refresh tokens
   * @param userId - User ID
   * @param email - User email
   * @returns Token pair
   */
  private generateTokens(userId: string, email: string): TokensResponseDto {
    const payload = { sub: userId, email };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_ACCESS_SECRET'),
      expiresIn: JWT_CONFIG.ACCESS_TOKEN_EXPIRY,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: JWT_CONFIG.REFRESH_TOKEN_EXPIRY,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * Hash refresh token and update in database
   * @param userId - User ID
   * @param refreshToken - Refresh token to hash and store
   */
  private async updateRefreshToken(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const hashedRefreshToken = await this.hashPassword(refreshToken);
    await this.userRepository.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  /**
   * Hash password using bcrypt
   * @param password - Plain text password
   * @returns Hashed password
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   * @param plainPassword - Plain text password
   * @param hashedPassword - Hashed password to compare against
   * @returns True if password matches
   */
  private async verifyPassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Map User entity to UserResponseDto
   * @param user - User entity
   * @returns User response DTO
   */
  private mapToUserResponse(user: UserEntity): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
