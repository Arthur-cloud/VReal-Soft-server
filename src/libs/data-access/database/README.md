# Database Module

Professional database module with TypeORM integration for VReal application.

## Features

- ✅ Centralized database configuration
- ✅ Migration support
- ✅ Custom logger for SQL queries
- ✅ Connection pooling
- ✅ Query result caching
- ✅ Base entity with common fields
- ✅ Environment-based configuration
- ✅ Production-ready settings

## Usage

### Import in AppModule

```typescript
import { DatabaseModule } from '@db/data-access/database';

@Module({
  imports: [DatabaseModule],
})
export class AppModule {}
```

### Extend BasicEntity

```typescript
import { Entity, Column } from 'typeorm';
import { BasicEntity } from '@db/data-access/database';

@Entity('users')
export class UserEntity extends BasicEntity {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
```

## Environment Variables

Required environment variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=vreal
DB_POOL_SIZE=10
DB_RUN_MIGRATIONS=false
NODE_ENV=development
```

## Migrations

### Generate Migration

```bash
npm run migration:generate -- src/libs/data-access/database/src/module/migrations/MigrationName
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Migration

```bash
npm run migration:revert
```

## Database Configuration

The module automatically adjusts based on the environment:

**Development:**
- synchronize: true (auto-sync schema)
- logging: ['query', 'error', 'warn']
- Detailed query logging

**Production:**
- synchronize: false (migrations only)
- logging: ['error', 'warn']
- Optimized performance

## Features Details

### Custom Logger

Logs all SQL queries with parameters, errors, and slow queries using NestJS logger.

### Connection Pool

- Default pool size: 10 connections
- Configurable via `DB_POOL_SIZE`
- Automatic connection timeout: 5s
- Idle timeout: 30s

### Query Cache

- Database-based caching
- Default duration: 1 minute
- Table: `query_result_cache`

### BasicEntity

Provides common fields for all entities:
- `id` (UUID primary key)
- `createdAt` (timestamp with timezone)
- `updatedAt` (timestamp with timezone)

All fields are exposed via class-transformer decorators.
