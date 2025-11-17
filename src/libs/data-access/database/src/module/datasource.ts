import { ConfigService } from '@nestjs/config';
import { join } from 'node:path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseLogger } from './logger/database.logger';

async function createDataSource(): Promise<DataSource> {
  // Load environment variables
  const configService = new ConfigService();

  const typeOrmOptions: DataSourceOptions = {
    type: 'postgres',
    host: configService.get('DB_HOST') || 'localhost',
    port: configService.get('DB_PORT') || 5432,
    username: configService.get('DB_USERNAME') || 'postgres',
    password: configService.get('DB_PASSWORD') || 'postgres',
    database: configService.get('DB_DATABASE') || 'vreal',
    logging: ['migration', 'error', 'warn'],
    logger: new DatabaseLogger(),
    synchronize: false, // Always false for migrations
    entities: [
      join(__dirname, '../../**/*.entity.{ts,js}'),
      join(__dirname, '../../../**/*.entity.{ts,js}'),
    ],
    migrations: [join(__dirname, 'migrations', '**/*{.ts,.js}')],
  };

  return new DataSource(typeOrmOptions);
}

export const AppDataSource = createDataSource();
