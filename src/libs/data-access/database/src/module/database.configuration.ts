import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'node:path';

import { databaseMigrations } from './database.migrations';
import { DatabaseLogger } from './logger/database.logger';

@Injectable()
export class DatabaseConfiguration implements TypeOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {}

  async createTypeOrmOptions(): Promise<TypeOrmModuleOptions> {
    const migrationsPattern = join(
      __dirname,
      'migrations',
      '**/*{.ts,.js}',
    );

    const isDevelopment = this.configService.get('NODE_ENV') !== 'production';

    return {
      type: 'postgres',
      applicationName: 'vreal-api',
      host: this.configService.get('DB_HOST') || 'localhost',
      port: this.configService.get('DB_PORT') || 5432,
      username: this.configService.get('DB_USERNAME') || 'postgres',
      password: this.configService.get('DB_PASSWORD') || 'postgres',
      database: this.configService.get('DB_DATABASE') || 'vreal',
      logging: isDevelopment ? ['query', 'error', 'warn'] : ['error', 'warn'],
      logger: new DatabaseLogger(),
      synchronize: isDevelopment, // Only in development
      migrationsRun: this.configService.get('DB_RUN_MIGRATIONS') === 'true',
      autoLoadEntities: true,
      dropSchema: false,
      maxQueryExecutionTime: 5000, // 5 seconds
      migrations: [migrationsPattern, ...databaseMigrations],
      poolSize: this.configService.get('DB_POOL_SIZE') || 10,
      extra: {
        max: this.configService.get('DB_POOL_SIZE') || 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
      },
      cache: {
        type: 'database',
        tableName: 'query_result_cache',
        duration: 60000, // 1 minute
      },
    } satisfies TypeOrmModuleOptions;
  }
}
