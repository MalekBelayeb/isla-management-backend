import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { TenantMapper } from './mappers/tenants.mapper';

@Module({
  controllers: [TenantController],
  providers: [TenantService, PrismaService, TenantMapper],
})
export class TenantModule {}
