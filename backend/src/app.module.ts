import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from './database/data-source';
import { UnipileModule } from './app/unipile/unipile.module';
import { CoreModule } from './app/core/core.module';

@Module({
  imports: [
    // Load .env.local app-wide so config is available everywhere.
    ConfigModule.forRoot({ envFilePath: '.env.local', isGlobal: true }),
    // Reuse the same connection options as the migration CLI DataSource.
    TypeOrmModule.forRoot(dataSourceOptions),
    UnipileModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
