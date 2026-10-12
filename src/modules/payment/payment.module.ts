import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './payment.controller';
import { FinancialBalanceService } from './services/financial-balance.service';
import { PrismaService } from '../../infrastructure/prisma.service';
import { FinancialOperationsService } from './services/financial-operations.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PrismaService,
    FinancialBalanceService,
    FinancialOperationsService,
  ],
})
export class PaymentModule {}
