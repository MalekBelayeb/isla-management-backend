import { Injectable } from '@nestjs/common';
import { PaymentMethodType, Prisma, PaymentType } from '@prisma/client';
import { PrismaService } from 'src/infrastructure/prisma.service';
import { FinancialOperationsFindArgs } from '../types/financial-operations.find';

@Injectable()
export class FinancialOperationsService {
  constructor(private prisma: PrismaService) {}

  async findFinancialOperations(
    financialBalanceArgs: FinancialOperationsFindArgs,
  ) {
    const { startDate, endDate, type } = financialBalanceArgs;

    if (!startDate || !endDate) {
      return;
    }

    const start = new Date(startDate);
    const end = this.toEndOfDay(endDate);

    const paymentDateIntervalCriteria: Prisma.DateTimeFilter = {
      gte: start,
      lte: end,
    };

    const { ownerId, propertyId, agreementId, apartmentId, paymentMethod } =
      financialBalanceArgs;

    const page = financialBalanceArgs.page ?? 0;
    const limit = financialBalanceArgs.limit ?? 50;

    // every filter must match (AND): spreading several `OR` keys into the
    // same object made the last one overwrite the others
    const whereCriteria: Prisma.PaymentWhereInput = {
      isArchived: false,

      ...(paymentDateIntervalCriteria && {
        createdAt: paymentDateIntervalCriteria,
      }),

      AND: [
        // Type OR payment method
        ...(type || paymentMethod
          ? [
              {
                [financialBalanceArgs.filterType]: [
                  ...(type
                    ? [{ type: { in: type.split(',') as PaymentType[] } }]
                    : []),

                  ...(paymentMethod
                    ? [
                        {
                          method: {
                            in: paymentMethod.split(',') as PaymentMethodType[],
                          },
                        },
                      ]
                    : []),
                ],
              },
            ]
          : []),

        // Owner filter
        ...(ownerId
          ? [
              {
                OR: [
                  {
                    agreement: {
                      isArchived: false,
                      apartment: {
                        isArchived: false,
                        property: {
                          isArchived: false,
                          owner: {
                            isArchived: false,
                            id: ownerId,
                          },
                        },
                      },
                    },
                  },
                  {
                    property: {
                      isArchived: false,
                      owner: {
                        isArchived: false,
                        id: ownerId,
                      },
                    },
                  },
                ],
              },
            ]
          : []),

        // Property filter
        ...(propertyId
          ? [
              {
                OR: [
                  {
                    agreement: {
                      isArchived: false,
                      status: 'ACTIVE' as const,
                      apartment: {
                        isArchived: false,
                        property: {
                          id: propertyId,
                          isArchived: false,
                        },
                      },
                    },
                  },
                  { propertyId },
                ],
              },
            ]
          : []),

        // Agreement filter
        ...(agreementId
          ? [
              {
                agreement: {
                  isArchived: false,
                  status: 'ACTIVE' as const,
                  id: agreementId,
                },
              },
            ]
          : []),

        // Apartment filter
        ...(apartmentId
          ? [
              {
                agreement: {
                  isArchived: false,
                  status: 'ACTIVE' as const,
                  apartment: {
                    id: apartmentId,
                    isArchived: false,
                  },
                },
              },
            ]
          : []),
      ],
    };

    const payments = await this.getPayments(whereCriteria, page, limit);

    const financialBalance =
      await this.calculateFinancialBalanceByDateInterval(whereCriteria);

    return {
      payments,
      ...financialBalance,
    };
  }

  // A full timestamp (e.g. 2026-10-31T23:59:59.999+01:00) is used as is;
  // a plain date (YYYY-MM-DD) is extended to the end of that day
  private toEndOfDay(value: string): Date {
    const date = new Date(value);
    if (!value.includes('T')) {
      date.setHours(23, 59, 59, 999);
    }
    return date;
  }

  async getPayments(
    whereCriteria: Prisma.PaymentWhereInput,
    page: number,
    limit: number,
  ) {
    const payments = await this.prisma.payment.findMany({
      where: whereCriteria,
      select: {
        id: true,
        amount: true,
        extraCharge: true,
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
            owner: true,
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
                    owner: true,
                  },
                },
              },
            },
            tenant: {
              select: {
                id: true,
                fullname: true,
                gender: true,
                societyName: true,
                type: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
      ...(limit && { take: limit }),
      ...(page && { skip: (page - 1) * (limit ?? 0) }),
      orderBy: {
        createdAt: 'desc',
      },
    });

    return payments;
  }

  // Calculate property/apartment.. financial balance, total income and total expense by date interval
  async calculateFinancialBalanceByDateInterval(
    whereCriteria: Prisma.PaymentWhereInput,
  ) {
    const totalPayment = await this.prisma.payment.count({
      where: whereCriteria,
    });
    // get sum of expenses and sum of incomes by criteria
    const groupedSums = await this.prisma.payment.groupBy({
      by: ['type'],
      _sum: { amount: true, extraCharge: true },
      where: whereCriteria,
    });

    const groupedIncome = groupedSums.find((item) => item.type === 'income');

    const sumAmountByType = (type: string) =>
      groupedSums.find((item) => item.type === type)?._sum.amount?.toNumber() ??
      0;

    const totalExpense =
      groupedSums
        .find((item) => item.type === 'expense')
        ?._sum.amount?.toNumber() ?? 0;

    // agency / bank operations (no extra charges, not tied to a property)
    const totalOtherIncome =
      sumAmountByType('income_agency') + sumAmountByType('income_bank');

    const totalOtherExpense =
      sumAmountByType('expense_agency') + sumAmountByType('expense_bank');

    // totalIncome sum of (sum amount) + (sum extra charges)
    const totalIncome =
      (groupedIncome?._sum.amount?.toNumber() ?? 0) +
      (groupedIncome?._sum.extraCharge?.toNumber() ?? 0) +
      totalOtherIncome;

    // sum of total Expense + agency profit with tax +  total agency expense
    const totalNetExpense = totalExpense + totalOtherExpense;

    const netBalance: number = totalIncome - totalNetExpense;

    return {
      netBalance,
      totalIncome,
      totalExpense: totalNetExpense,
      totalPayment,
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

    return {
      totalIncome,
      grossProfit,
      taxAmount,
      profitWithTax,
      profitInPercentage,
    };
  }
}
