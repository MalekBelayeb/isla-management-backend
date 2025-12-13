import { Module } from '@nestjs/common';
import { ApartmentService } from './apartment.service';
import { ApartmentController } from './apartment.controller';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { ApartmentMapper } from './mapper/apartment.mapper';

@Module({
  controllers: [ApartmentController],
  providers: [ApartmentService, PrismaService, ApartmentMapper],
})
export class ApartmentModule {}
