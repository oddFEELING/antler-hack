import { config } from 'dotenv';
import { DataSource, DataSourceOptions } from 'typeorm';

// Load environment variables from .env.local so the TypeORM CLI (which runs
// outside the Nest application context) can read DATABASE_URL.
config({ path: '.env.local' });

// Connection options shared by both the NestJS runtime (TypeOrmModule) and the
// TypeORM CLI used for generating/running migrations. Keeping a single source
// of truth prevents the app and the CLI from drifting apart.
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // Neon (and most hosted Postgres) require TLS; this accepts their certs.
  ssl: { rejectUnauthorized: false },
  // Auto-create/update schema from entities. Convenient for fast iteration;
  // turn this off before generating real migrations.
  synchronize: true,
  // Discover entities and migrations via glob so new files are picked up
  // automatically without manual registration.
  entities: [__dirname + '/entities/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
};

// DataSource instance consumed by the TypeORM CLI (referenced via the -d flag
// in the package.json migration scripts).
const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
