import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAgreementDtoType } from './dto/create-agreement.dto';
import { UpdateAgreementDtoType } from './dto/update-agreement.dto';
import { Prisma } from '@prisma/client';
import { AgreementFindAllArgs } from './types/agreement.findAll.type';
import { consts } from '../../shared/contants/constants';
import { PrismaService } from '../../infrastructure/prisma.service';

@Injectable()
export class AgreementService {
  constructor(private prisma: PrismaService) {}

  async verifyTenantAgreementUniquenessCriteria(tenantId: string) {
    const tenantWithActiveAgreement = await this.prisma.tenant.findFirst({
      where: { isArchived: false, id: tenantId },
      select: {
        agreements: {
          where: {
            isArchived: false,
            status: 'ACTIVE',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (tenantWithActiveAgreement?.agreements?.length) {
      throw new HttpException(
        consts.message.tenantAlreadyHasAgreement,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async verifyApartmentAgreementUniquenessCriteria(apartmentId: string) {
    const apartmentWithActiveAgreement = await this.prisma.apartment.findFirst({
      where: { isArchived: false, id: apartmentId },
      select: {
        agreements: {
          where: {
            isArchived: false,
            status: 'ACTIVE',
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });

    if (apartmentWithActiveAgreement?.agreements?.length) {
      throw new HttpException(
        consts.message.apartmentAlreadyHasAgreement,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async create(createAgreementDto: CreateAgreementDtoType) {
    //check tenant or apartment hasnt active agreement already
    await this.verifyTenantAgreementUniquenessCriteria(
      createAgreementDto.tenantId,
    );
    await this.verifyApartmentAgreementUniquenessCriteria(
      createAgreementDto.apartmentId,
    );

    await this.prisma.agreement.create({
      data: {
        //matricule: createAgreementDto.matricule,
        rentAmount: createAgreementDto.rentAmount,
        startDate: createAgreementDto.startDate,
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
    propertyId,
    agreementProperty,
    tenantName,
    ownerName,
    apartmentAdress,
    limit,
    page,
  }: AgreementFindAllArgs) {
    const whereCriteria = {
      isArchived: false,
      ...(agreementProperty &&
        !isNaN(+agreementProperty) && {
          apartment: {
            isArchived: false,
            property: {
              isArchived: false,
              matricule: Number(agreementProperty),
            },
          },
        }),
      ...(tenantName && {
        tenant: {
          isArchived: false,
          OR: [
            { fullname: { contains: tenantName, mode: 'insensitive' } },
            { societyName: { contains: tenantName, mode: 'insensitive' } },
          ],
        },
      }),
      ...(apartmentAdress && {
        apartment: {
          isArchived: false,
          address: { contains: apartmentAdress, mode: 'insensitive' },
        },
      }),
      ...(ownerName && {
        apartment: {
          isArchived: false,
          property: {
            isArchived: false,
            owner: {
              isArchived: false,
              fullname: { contains: ownerName, mode: 'insensitive' },
            },
          },
        },
      }),
      ...((apartmentId || tenantId || propertyId || searchTerm) && {
        OR: [
          searchTerm &&
            !isNaN(+searchTerm) && { matricule: Number(searchTerm) },
          apartmentId && { apartmentId },
          tenantId && { tenantId },
          propertyId && {
            apartment: {
              isArchived: false,
              property: { isArchived: false, id: propertyId },
            },
          },
        ].filter(Boolean),
      }),
    } as Prisma.AgreementWhereInput;

    const [agreements, total] = await this.prisma.$transaction([
      this.prisma.agreement.findMany({
        where: whereCriteria,
        select: {
          id: true,
          rentAmount: true,
          startDate: true,
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
              property: {
                select: {
                  address: true,
                  matricule: true,
                  owner: {
                    select: {
                      fullname: true,
                      gender: true,
                      type: true,
                      society: true,
                      firstname: true,
                      lastname: true,
                    },
                  },
                },
              },
            },
          },
          tenant: {
            select: {
              id: true,
              matricule: true,
              firstname: true,
              lastname: true,
              gender: true,
              fullname: true,
              type: true,
              societyName: true,
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
            property: {
              select: {
                address: true,
                matricule: true,
                owner: {
                  select: {
                    fullname: true,
                    gender: true,
                    firstname: true,
                    lastname: true,
                    type: true,
                    society: true,
                    id: true,
                  },
                },
              },
            },
          },
        },
        tenant: {
          select: {
            id: true,
            matricule: true,
            firstname: true,
            lastname: true,
            gender: true,
            fullname: true,
            type: true,
            societyName: true,
          },
        },
      },
    });
    return agreement;
  }

  async update(id: string, updateAgreementDto: UpdateAgreementDtoType) {
    const agreement = await this.prisma.agreement.findFirst({
      where: { id, isArchived: false },
      select: {
        id: true,
        tenantId: true,
        apartmentId: true,
      },
    });
    //check tenant or apartment has changed
    if (agreement?.tenantId != updateAgreementDto.tenantId) {
      //check tenant or apartment hasnt active agreement already
      await this.verifyTenantAgreementUniquenessCriteria(
        updateAgreementDto.tenantId,
      );
    }
    //check tenant or apartment has changed
    if (agreement?.apartmentId != updateAgreementDto.apartmentId) {
      //check tenant or apartment hasnt active agreement already
      await this.verifyApartmentAgreementUniquenessCriteria(
        updateAgreementDto.apartmentId,
      );
    }

    await this.prisma.agreement.update({
      where: {
        id,
      },
      data: {
        //matricule: updateAgreementDto.matricule,
        rentAmount: updateAgreementDto.rentAmount,
        terminatedAt: updateAgreementDto.terminatedAt,
        terminationReason: updateAgreementDto.terminationReason,
        startDate: updateAgreementDto.startDate,
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
