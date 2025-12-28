import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { FinancialBalanceFindArgs } from '../types/financial-balance.find.type';
import { taxInPercentage } from 'src/shared/contants/constants';
import { PaymentMethodType } from 'generated/prisma';

@Injectable()
export class FinancialBalanceService {
  constructor(private prisma: PrismaService) {}

  async findFinancialBalance({
    ownerId,
    propertyId,
    startDate,
    endDate,
    agreementId,
    apartmentId,
    paymentMethod,
    type,
  }: FinancialBalanceFindArgs) {
    let createdAtCriteria;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);
      createdAtCriteria = startDate &&
        endDate && {
          paymentDate: {
            gte: start,
            lte: end,
          },
        };
    }

    const types = type?.split(',');

    const payments = await this.prisma.payment.findMany({
      where: {
        isArchived: false,
        ...(createdAtCriteria && createdAtCriteria),
        ...(types && { type: { in: types } }),
        ...(paymentMethod && {
          method: { in: paymentMethod?.split(',') as PaymentMethodType[] },
          isArchived: false,
        }),
        ...(ownerId && { agreement: { apartment: { property: { ownerId } } } }),
        ...(propertyId && {
          OR: [{ agreement: { apartment: { propertyId } } }, { propertyId }],
        }),
        ...(agreementId && { agreementId }),
        ...(apartmentId && { agreement: { apartmentId } }),
      },

      select: {
        id: true,
        amount: true,
        type: true,
        label: true,
        category: true,
        method: true,
        createdAt: true,
        tenantId: true,
        apartmentId: true,
        property: {
          select: {
            matricule: true,
            profitInPercentage: true,
          },
        },
        agreementId: true,
        paymentDate: true,
        agreement: {
          select: {
            id: true,
            matricule: true,
            paymentFrequency: true,
            apartment: {
              select: {
                matricule: true,
                address: true,
                type: true,
                property: {
                  select: {
                    matricule: true,
                    profitInPercentage: true,
                  },
                },
              },
            },
            tenant: {
              select: {
                id: true,
                fullname: true,
                gender: true,
              },
            },
          },
        },
      },
      orderBy: {
        paymentDate: 'asc',
      },
    });

    const groupedSums = await this.prisma.payment.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: {
        isArchived: false,
        ...(createdAtCriteria && createdAtCriteria),
        ...(types && { type: { in: types } }),
        ...(paymentMethod && {
          method: { in: paymentMethod?.split(',') as PaymentMethodType[] },
          isArchived: false,
        }),
        ...(ownerId && { agreement: { apartment: { property: { ownerId } } } }),
        ...(propertyId && {
          OR: [{ agreement: { apartment: { propertyId } } }, { propertyId }],
        }),
        ...(agreementId && { agreementId }),
        ...(apartmentId && { agreement: { apartmentId } }),
      },
    });

    const totalIncome =
      groupedSums
        .find((item) => item.type === 'income')
        ?._sum.amount?.toNumber() ?? 0;

    let profit:
      | {
          grossProfit: number;
          taxAmount: number;
          profitWithTax: number;
          profitInPercentage: number;
        }
      | undefined;

    const property = payments.find((item) => item.type === 'income')?.agreement
      ?.apartment.property;
    if (propertyId && totalIncome > 0 && property) {
      profit = this.calculateAgencyProfitByProperty(
        totalIncome,
        taxInPercentage,
        property.profitInPercentage,
      );
    }
    const totalAgencyExpense =
      groupedSums
        .find((item) => item.type === 'expense_agency')
        ?._sum.amount?.toNumber() ?? 0;

    const totalExpense =
      (groupedSums
        .find((item) => item.type === 'expense')
        ?._sum.amount?.toNumber() ?? 0) +
      (profit?.profitWithTax ?? 0) +
      (totalAgencyExpense ?? 0);

    const netBalance: number = totalIncome - totalExpense;

    return {
      netBalance,
      totalIncome,
      totalExpense,
      payments,
      ...(profit && { profit }),
    };
  }

  calculateAgencyProfitByProperty(
    totalIncome: number,
    taxInPercentage: number,
    profitInPercentage: number,
  ) {
    const grossProfit = (totalIncome * profitInPercentage) / 100; // brut profit
    const taxAmount = (grossProfit * taxInPercentage) / 100; // tva profit
    const profitWithTax = grossProfit + taxAmount;

    return { grossProfit, taxAmount, profitWithTax, profitInPercentage };
  }
}
