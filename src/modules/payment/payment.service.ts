import { Injectable } from '@nestjs/common';
import { CreatePaymentDtoType } from './dto/create-payment.dto';
import { UpdatePaymentDtoType } from './dto/update-payment.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { PaymentType, Prisma } from 'generated/prisma';
import { PaymentFindAllArgs } from './types/payment.findAll.type';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}

  async create(createPaymentDto: CreatePaymentDtoType) {
    await this.prisma.payment.create({
      data: {
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        paymentDate: createPaymentDto.paymentDate,
        type: createPaymentDto.type,
        category: createPaymentDto.category,
        agreementId: createPaymentDto.agreementId,
        notes: createPaymentDto.notes,
        label: createPaymentDto.label,
        ...(createPaymentDto.rentStartDate && {
          rentStartDate: new Date(createPaymentDto.rentStartDate),
        }),
        ...(createPaymentDto.rentEndDate && {
          rentEndDate: new Date(createPaymentDto.rentEndDate),
        }),
      },
    });
  }

  async findAll({
    agreementId,
    apartmentId,
    tenantId,
    startDate,
    endDate,
    paymentMethod,
    limit,
    page,
  }: PaymentFindAllArgs) {
    let createdAtCriteria;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      end.setHours(23, 59, 59, 999);
      createdAtCriteria = startDate &&
        endDate && {
          createdAt: {
            gte: start,
            lte: end,
          },
        };
    }

    const whereCriteria = {
      isArchived: false,
      ...(createdAtCriteria && createdAtCriteria),
      ...((apartmentId || tenantId || agreementId || paymentMethod) && {
        OR: [
          apartmentId && { agreement: { apartmentId } },
          tenantId && { agreement: { tenantId } },
          agreementId && { agreementId },
          paymentMethod && { method: paymentMethod },
        ].filter(Boolean),
      }),
    } as Prisma.PaymentWhereInput;
    console.log(whereCriteria);
    const [payments, total] = await this.prisma.$transaction([
      this.prisma.payment.findMany({
        where: whereCriteria,
        select: {
          id: true,
          amount: true,
          type: true,
          category: true,
          method: true,
          createdAt: true,
          tenantId: true,
          apartmentId: true,
          agreementId: true,
          label: true,
          rentStartDate: true,
          rentEndDate: true,
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
        ...(limit && { take: limit }),
        ...(page && { skip: (page - 1) * (limit ?? 0) }),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.payment.count({
        where: whereCriteria,
      }),
    ]);

    return { meta: { page, limit, total }, payments };
  }

  async findOne(id: string) {
    const agreement = await this.prisma.payment.findFirst({
      where: { id, isArchived: false },

      select: {
        id: true,
        amount: true,
        type: true,
        method: true,
        category: true,
        label: true,
        createdAt: true,
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
    });
    return agreement;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDtoType) {
    await this.prisma.payment.update({
      where: {
        id,
      },
      data: {
        amount: updatePaymentDto.amount,
        method: updatePaymentDto.method,
        paymentDate: updatePaymentDto.paymentDate,
        type: updatePaymentDto.type,
        label: updatePaymentDto.label,
        category: updatePaymentDto.category,
        agreementId: updatePaymentDto.agreementId,
        notes: updatePaymentDto.notes,
      },
    });
  }

  async findFinancialBalance(
    ownerId?: string,
    propertyId?: string,
    agreementId?: string,
    apartmentId?: string,
    type?: PaymentType,
  ) {
    const payments = await this.prisma.payment.findMany({
      where: {
        isArchived: false,
        ...(type && { type }),
        ...(ownerId && { agreement: { apartment: { property: { ownerId } } } }),
        ...(propertyId && { agreement: { apartment: { propertyId } } }),
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
        agreementId: true,
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
        createdAt: 'desc',
      },
    });
    const groupedSums = await this.prisma.payment.groupBy({
      by: ['type'],
      _sum: { amount: true },
      where: {
        isArchived: false,
        ...(propertyId && { agreement: { apartment: { propertyId } } }),
        ...(agreementId && { agreementId }),
        ...(apartmentId && { agreement: { apartmentId } }),
      },
    });
    const totalIncome =
      groupedSums
        .find((item) => item.type === 'income')
        ?._sum.amount?.toNumber() ?? 0;
    const totalExpense =
      groupedSums
        .find((item) => item.type === 'expense')
        ?._sum.amount?.toNumber() ?? 0;
    const netBalance: number = totalIncome - totalExpense;
    return { netBalance, totalIncome, totalExpense, payments };
  }

  async remove(id: string) {
    await this.prisma.payment.update({
      where: {
        id,
      },
      data: {
        isArchived: true,
      },
    });
  }
}
