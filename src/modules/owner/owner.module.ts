import { Module } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OwnerController } from './owner.controller';
import { PrismaService } from 'src/infrastructure/prisma.infra';

@Module({
  controllers: [OwnerController],
  providers: [OwnerService, PrismaService],
})
export class OwnerModule {}
