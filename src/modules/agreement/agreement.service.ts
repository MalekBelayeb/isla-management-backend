import { Injectable } from '@nestjs/common';
import { CreateAgreementDtoType } from './dto/create-agreement.dto';
import { UpdateAgreementDtoType } from './dto/update-agreement.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { Prisma } from 'generated/prisma';
import { AgreementFindAllArgs } from './types/agreement.findAll.type';

@Injectable()
export class AgreementService {
  constructor(private prisma: PrismaService) {}
  async create(createAgreementDto: CreateAgreementDtoType) {
    await this.prisma.agreement.create({
      data: {
        matricule: createAgreementDto.matricule,
        rentAmount: createAgreementDto.rentAmount,
        startDate: createAgreementDto.startDate,
        expireDate: createAgreementDto.expireDate,
        notes: createAgreementDto.notes,
        nbDaysOfTolerance: createAgreementDto.nbDaysOfTolerance,
        apartmentId: createAgreementDto.apartmentId,
        tenantId: createAgreementDto.tenantId,
        deposit: createAgreementDto.deposit,
        firstDayOfPayment: createAgreementDto.firstDayOfPayment,
        paymentFrequency: createAgreementDto.paymentFrequency,
        status: createAgreementDto.status,
        documentUrl: createAgreementDto.documentUrl,
      },
    });
  }

  async findAll({
    searchTerm,
    apartmentId,
    tenantId,
    startDate,
    endDate,
    agreementStatus,
    limit,
    page,
  }: AgreementFindAllArgs) {
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

      ...((apartmentId || tenantId || searchTerm || agreementStatus) && {
        OR: [
          searchTerm && { matricule: searchTerm },
          apartmentId && { apartmentId },
          tenantId && { tenantId },
          agreementStatus &&
            agreementStatus === 'active' && {
              expireDate: {
                gte: new Date(),
              },
              startDate: {
                lte: new Date(),
              },
            },
          agreementStatus &&
            agreementStatus === 'expired' && {
              expireDate: {
                lte: new Date(),
              },
            },
          agreementStatus &&
            agreementStatus === 'suspended' && {
              status: 'TERMINATED',
            },
        ].filter(Boolean),
      }),
    } as Prisma.AgreementWhereInput;
    console.log(JSON.stringify(whereCriteria));

    const [agreements, total] = await this.prisma.$transaction([
      this.prisma.agreement.findMany({
        where: whereCriteria,
        select: {
          id: true,
          rentAmount: true,
          startDate: true,
          expireDate: true,
          status: true,
          nbDaysOfTolerance: true,
          paymentFrequency: true,
          matricule: true,
          createdAt: true,
          signedAt: true,
          apartment: {
            select: {
              id: true,
              matricule: true,
              address: true,
              type: true,
            },
          },
          tenant: {
            select: {
              id: true,
              matricule: true,
              gender: true,
              fullname: true,
            },
          },
        },
        ...(limit && { take: limit }),
        ...(page && { skip: (page - 1) * (limit ?? 0) }),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.agreement.count({ where: whereCriteria }),
    ]);
    return { meta: { page, limit, total }, agreements };
  }

  async findOne(id: string) {
    const agreement = await this.prisma.agreement.findFirst({
      where: { id, isArchived: false },
      select: {
        id: true,
        rentAmount: true,
        startDate: true,
        expireDate: true,
        status: true,
        paymentFrequency: true,
        nbDaysOfTolerance: true,
        matricule: true,
        createdAt: true,
        signedAt: true,
        apartment: {
          select: {
            id: true,
            matricule: true,
            address: true,
            type: true,
          },
        },
        tenant: {
          select: {
            id: true,
            matricule: true,
            gender: true,
            fullname: true,
          },
        },
      },
    });
    return agreement;
  }

  async update(id: string, updateAgreementDto: UpdateAgreementDtoType) {
    await this.prisma.agreement.update({
      where: {
        id,
      },
      data: {
        matricule: updateAgreementDto.matricule,
        rentAmount: updateAgreementDto.rentAmount,
        terminatedAt: updateAgreementDto.terminatedAt,
        terminationReason: updateAgreementDto.terminationReason,
        startDate: updateAgreementDto.startDate,
        expireDate: updateAgreementDto.expireDate,
        nbDaysOfTolerance: updateAgreementDto.nbDaysOfTolerance,
        notes: updateAgreementDto.notes,
        apartmentId: updateAgreementDto.apartmentId,
        tenantId: updateAgreementDto.tenantId,
        deposit: updateAgreementDto.deposit,
        firstDayOfPayment: updateAgreementDto.firstDayOfPayment,
        paymentFrequency: updateAgreementDto.paymentFrequency,
        status: updateAgreementDto.status,
        documentUrl: updateAgreementDto.documentUrl,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.agreement.update({
      where: {
        id,
      },
      data: {
        isArchived: true,
      },
    });
  }
}
