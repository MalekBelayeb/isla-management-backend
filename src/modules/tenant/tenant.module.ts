import { Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantMapper } from './mappers/tenants.mapper';
import { PrismaService } from '../../infrastructure/prisma.service';

@Module({
  controllers: [TenantController],
  providers: [TenantService, PrismaService, TenantMapper],
})
export class TenantModule {}
