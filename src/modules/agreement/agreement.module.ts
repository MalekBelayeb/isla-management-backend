import { Module } from '@nestjs/common';
import { AgreementService } from './agreement.service';
import { AgreementController } from './agreement.controller';
import { PrismaService } from 'src/infrastructure/prisma.infra';

@Module({
  controllers: [AgreementController],
  providers: [AgreementService, PrismaService],
})
export class AgreementModule {}
