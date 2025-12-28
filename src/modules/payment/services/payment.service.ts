import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreatePaymentDtoType } from '../dto/create-payment.dto';
import { UpdatePaymentDtoType } from '../dto/update-payment.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { PaymentMethodType, PaymentType, Prisma } from 'generated/prisma';
import { PaymentFindAllArgs } from '../types/payment.findAll.type';
import { consts } from 'src/shared/contants/constants';
import { Decimal } from 'generated/prisma/runtime/library';

@Injectable()
export class PaymentService {
  constructor(private prisma: PrismaService) {}
  async checkAgreementValidity(agreementId: string) {
    const agreement = await this.prisma.agreement.findFirst({
      where: {
        isArchived: false,
        id: agreementId,
      },
    });
    if (!agreement) {
      throw new HttpException(
        consts.message.agreementNotFound,
        HttpStatus.BAD_REQUEST,
      );
    }
    if (agreement.status === 'SUSPENDED') {
      throw new HttpException(
        consts.message.agreementSuspended,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async create(createPaymentDto: CreatePaymentDtoType) {
    let propertyId = '';
    if (
      createPaymentDto.type === 'expense' &&
      createPaymentDto.matriculeProperty &&
      !isNaN(+createPaymentDto.matriculeProperty)
    ) {
      const property = await this.prisma.property.findFirst({
        where: {
          isArchived: false,
          matricule: Number(createPaymentDto.matriculeProperty),
        },
      });
      if (!property) {
        throw new HttpException(
          consts.message.propertyNotFound,
          HttpStatus.BAD_REQUEST,
        );
      }
      propertyId = property.id;
    }

    if (
      createPaymentDto.type === 'income' &&
      createPaymentDto.category === 'rent'
    ) {
      await this.checkAgreementValidity(createPaymentDto.agreementId ?? '');
    }

    const newPayment = await this.prisma.payment.create({
      data: {
        amount: createPaymentDto.amount,
        method: createPaymentDto.method,
        paymentDate: createPaymentDto.paymentDate,
        type: createPaymentDto.type,
        bank: createPaymentDto.bank,
        checkNumber: createPaymentDto.checkNumber,
        transferNumber: createPaymentDto.transferNumber,
        category: createPaymentDto.category,
        ...(createPaymentDto.agreementId && {
          agreementId: createPaymentDto.agreementId,
        }),
        ...(propertyId && {
          propertyId,
        }),
        ...(createPaymentDto.tva && {
          tva: createPaymentDto.tva,
        }),
        notes: createPaymentDto.notes,
        label: createPaymentDto.label,
        rentStartDate: createPaymentDto.rentStartDate,
        rentEndDate: createPaymentDto.rentEndDate,
      },
    });
    return { id: newPayment.id };
  }

  async findAll({
    agreementId,
    apartmentId,
    ownerId,
    tenantId,
    startDate,
    paymentType,
    paymentAgreement,
    paymentProperty,
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
          paymentDate: {
            gte: start,
            lte: end,
          },
        };
    }
    const whereCriteria = {
      isArchived: false,
      ...(createdAtCriteria && createdAtCriteria),
      type: { not: 'expense_agency' },
      ...((apartmentId ||
        tenantId ||
        agreementId ||
        paymentMethod ||
        paymentType) && {
        OR: [
          ownerId && {
            agreement: { apartment: { property: { ownerId } } },
          },
          apartmentId && { agreement: { apartmentId, isArchived: false } },
          tenantId && { agreement: { tenantId, isArchived: false } },
          agreementId && { agreementId, isArchived: false },
          paymentMethod && {
            method: { in: paymentMethod?.split(',') as PaymentMethodType[] },
            isArchived: false,
          },
          paymentType && { type: paymentType, isArchived: false },
        ].filter(Boolean),
      }),
      ...(paymentAgreement &&
        !isNaN(+paymentAgreement) && {
          agreement: { matricule: Number(paymentAgreement) },
        }),
      ...(paymentProperty &&
        !isNaN(+paymentProperty) && {
          agreement: {
            apartment: {
              isArchived: false,
              property: {
                isArchived: false,
                matricule: Number(paymentProperty),
              },
            },
          },
        }),
    } as Prisma.PaymentWhereInput;

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
          paymentDate: true,
          property: {
            select: {
              id: true,
              matricule: true,
              address: true,
              owner: {
                select: {
                  gender: true,
                  fullname: true,
                },
              },
            },
          },
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
                      id: true,
                      matricule: true,
                      address: true,
                      owner: {
                        select: {
                          gender: true,
                          fullname: true,
                        },
                      },
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
    const payment = await this.prisma.payment.findFirst({
      where: { id, isArchived: false },

      select: {
        id: true,
        amount: true,
        type: true,
        method: true,
        category: true,
        label: true,
        propertyId: true,
        rentStartDate: true,
        paymentDate: true,
        rentEndDate: true,
        createdAt: true,
        tva: true,
        bank: true,
        transferNumber: true,
        checkNumber: true,
        property: {
          select: {
            id: true,
            matricule: true,
            address: true,
            owner: {
              select: {
                gender: true,
                fullname: true,
              },
            },
          },
        },
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
                    id: true,
                    matricule: true,
                    address: true,
                    owner: {
                      select: {
                        gender: true,
                        fullname: true,
                      },
                    },
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
    });
    return payment;
  }

  async update(id: string, updatePaymentDto: UpdatePaymentDtoType) {
    let propertyId = '';
    if (
      updatePaymentDto.type === 'expense' &&
      updatePaymentDto.matriculeProperty &&
      !isNaN(+updatePaymentDto.matriculeProperty)
    ) {
      const property = await this.prisma.property.findFirst({
        where: {
          isArchived: false,
          matricule: Number(updatePaymentDto.matriculeProperty),
        },
      });
      if (!property) {
        throw new HttpException(
          consts.message.propertyNotFound,
          HttpStatus.BAD_REQUEST,
        );
      }
      propertyId = property.id;
    }

    if (
      updatePaymentDto.type === 'income' &&
      updatePaymentDto.category === 'rent'
    ) {
      await this.checkAgreementValidity(updatePaymentDto.agreementId ?? '');
    }

    const updatedPayment = await this.prisma.payment.update({
      where: {
        id,
      },
      data: {
        amount: updatePaymentDto.amount,
        method: updatePaymentDto.method,
        paymentDate: updatePaymentDto.paymentDate,
        type: updatePaymentDto.type,
        label: updatePaymentDto.label,
        tva: updatePaymentDto.tva,
        bank: updatePaymentDto.bank,
        transferNumber: updatePaymentDto.transferNumber,
        checkNumber: updatePaymentDto.checkNumber,
        category: updatePaymentDto.category,
        ...(propertyId &&
          updatePaymentDto.type === 'expense' && {
            propertyId,
          }),
        ...(updatePaymentDto.agreementId &&
          updatePaymentDto.type === 'income' && {
            agreementId: updatePaymentDto.agreementId,
          }),
        notes: updatePaymentDto.notes,
        rentStartDate: updatePaymentDto.rentStartDate,
        rentEndDate: updatePaymentDto.rentEndDate,
      },
    });

    return { id: updatedPayment.id };
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
