import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    //console.log(process.env.DATABASE_URL);
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log:
        process.env.NODE_ENV === 'production'
          ? ['info', 'warn', 'error']
          : [
              { emit: 'event', level: 'query' },
              { emit: 'event', level: 'error' },
              { emit: 'event', level: 'warn' },
              { emit: 'event', level: 'info' },
            ],
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      await this.$queryRaw`SELECT 1`;

      this.logger.log('Successfully connected to PostgreSQL');
    } catch (error) {
      this.logger.error(
        'Failed to connect to PostgreSQL',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
