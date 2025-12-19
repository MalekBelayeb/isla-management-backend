import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { FinancialBalanceService } from './services/financial-balance.service';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, PrismaService, FinancialBalanceService],
})
export class PaymentModule {}
