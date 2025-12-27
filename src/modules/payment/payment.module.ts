import { Module } from '@nestjs/common';
import { PaymentService } from './services/payment.service';
import { PaymentController } from './payment.controller';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { FinancialBalanceService } from './services/financial-balance.service';
import { PaymentReceiptGeneratorService } from './services/payment-receipt-generator.service';

@Module({
  controllers: [PaymentController],
  providers: [
    PaymentService,
    PrismaService,
    FinancialBalanceService,
    PaymentReceiptGeneratorService,
  ],
})
export class PaymentModule {}
