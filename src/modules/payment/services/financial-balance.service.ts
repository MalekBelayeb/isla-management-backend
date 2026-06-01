import { Injectable } from '@nestjs/common';
import { FinancialBalanceFindArgs } from '../types/financial-balance.find.type';
import { PaymentMethodType, Prisma } from '@prisma/client';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { taxInPercentage } from '../../../shared/contants/constants';

@Injectable()
export class FinancialBalanceService {
  constructor(private prisma: PrismaService) {}

  async findFinancialBalance(financialBalanceArgs: FinancialBalanceFindArgs) {
    const { startDate, endDate, type, previousStartDate, previousEndDate } =
      financialBalanceArgs;

    if (!startDate || !endDate) {
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    end.setHours(23, 59, 59, 999);

    const paymentDateIntervalCriteria: Prisma.DateTimeFilter = {
      gte: start,
      lte: end,
    };

    const types = type?.split(',') ?? [];

    const financialBalance = await this.calculateFinancialBalanceByDateInterval(
      paymentDateIntervalCriteria,
      types,
      financialBalanceArgs,
    );

    let previousPeriodFinancialBalance;

    // calculate previous period financial balance, to get amount that still needs to be paid from previous period
    if (previousStartDate && previousEndDate) {
      const previousStart = new Date(previousStartDate);
      const previousEnd = new Date(previousEndDate);

      end.setHours(23, 59, 59, 999);

      const previousDateIntervalCriteria: Prisma.DateTimeFilter = {
        gte: previousStart,
        lte: previousEnd,
      };

      previousPeriodFinancialBalance =
        await this.calculateFinancialBalanceByDateInterval(
          previousDateIntervalCriteria,
          types,
          financialBalanceArgs,
        );
    }

    return {
      ...financialBalance,
      ...(previousPeriodFinancialBalance && {
        netBalance:
          financialBalance.netBalance -
          previousPeriodFinancialBalance.netBalance,
        totalExpense:
          financialBalance.totalExpense +
          previousPeriodFinancialBalance.netBalance,
        previousPeriodNetBalance: previousPeriodFinancialBalance.netBalance,
      }),
    };
  }

  // Calculate property/apartment.. financial balance, total income and total expense by date interval
  async calculateFinancialBalanceByDateInterval(
    paymentDateIntervalCriteria: Prisma.DateTimeFilter,
    types: string[],
    financialBalanceArgs: FinancialBalanceFindArgs,
  ) {
    const { ownerId, propertyId, agreementId, apartmentId, paymentMethod } =
      financialBalanceArgs;

    const whereCriteria = {
      isArchived: false,
      ...(paymentDateIntervalCriteria && {
        paymentDate: paymentDateIntervalCriteria,
      }),
      ...(types.length && { type: { in: types } }),
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
    } as Prisma.PaymentWhereInput;

    // get all payments by criteria
    const payments = await this.prisma.payment.findMany({
      where: whereCriteria,
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

    // get sum of expenses and sum of incomes by criteria
    const groupedSums = await this.prisma.payment.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: whereCriteria,
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

  // Calculate agency profit with and without tax
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
