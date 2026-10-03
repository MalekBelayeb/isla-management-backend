import { Injectable } from '@nestjs/common';
import { CreateTenantDtoType } from './dto/create-tenant.dto';
import { UpdateTenantDtoType } from './dto/update-tenant.dto';
import { Prisma } from '@prisma/client';
import { TenantFindAllArgs } from './types/tenant.findAll.type';
import { TenantMapper } from './mappers/tenants.mapper';
import { PrismaService } from '../../infrastructure/prisma.service';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private tenantsMapper: TenantMapper,
  ) {}
  async create(createTenantDto: CreateTenantDtoType) {
    try {
      await this.prisma.tenant.create({
        data: {
          type: createTenantDto.tenantType ?? 'natural',
          address: createTenantDto.address,
          cin: `${createTenantDto.cin}`,
          firstname: createTenantDto.firstname,
          lastname: createTenantDto.lastname,
          societyName: createTenantDto.societyName,
          job: createTenantDto.job,
          email: createTenantDto.email,
          fullname: `${createTenantDto.firstname} ${createTenantDto.lastname}`,
          nationality: createTenantDto.nationality,
          phoneNumber: `${createTenantDto.phoneNumber}`,
          gender: createTenantDto.gender,
          managerCin: createTenantDto.managerCin,
          managerFirstname: createTenantDto.managerFirstname,
          managerLastname: createTenantDto.managerLastname,
          managerPhoneNumber: createTenantDto.managerPhoneNumber,
        },
      });
    } catch (err) {
      console.log(err);
    }
  }

  async findAll({
    searchTerm,
    agreementId,
    apartmentId,
    tenantAgreement,
    tenantProperty,
    limit,
    page,
  }: TenantFindAllArgs) {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
    );
    const firstDayOfCurrentMonthWithTolerenceDays = new Date(
      firstDayOfCurrentMonth,
    );

    firstDayOfCurrentMonthWithTolerenceDays.setDate(
      firstDayOfCurrentMonth.getDate(),
    );

    const whereCriteria = {
      ...(searchTerm &&
        !isNaN(+searchTerm) && {
          OR: [
            { matricule: +searchTerm },
            { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
            { cin: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }),
      ...(searchTerm &&
        isNaN(+searchTerm) && {
          OR: [
            { fullname: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
            { societyName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }),
      ...(tenantAgreement &&
        !isNaN(+tenantAgreement) && {
          agreements: {
            some: {
              status: 'ACTIVE',
              isArchived: false,
              matricule: Number(tenantAgreement),
            },
          },
        }),
      ...(tenantProperty &&
        !isNaN(+tenantProperty) && {
          agreements: {
            some: {
              isArchived: false,
              status: 'ACTIVE',
              apartment: {
                isArchived: false,
                property: {
                  isArchived: false,
                  matricule: Number(tenantProperty),
                },
              },
            },
          },
        }),
      ...(agreementId && {
        agreements: {
          some: { status: 'ACTIVE', isArchived: false, id: agreementId },
        },
      }),
      ...(apartmentId && {
        agreements: {
          some: {
            status: 'ACTIVE',
            isArchived: false,
            apartment: { id: apartmentId },
          },
        },
      }),
    } as Prisma.TenantWhereInput;

    const [tenants, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where: { isArchived: false, ...whereCriteria },
        select: {
          id: true,
          address: true,
          cin: true,
          email: true,
          firstname: true,
          lastname: true,
          fullname: true,
          phoneNumber: true,
          createdAt: true,
          gender: true,
          job: true,
          matricule: true,
          nationality: true,
          type: true,
          societyName: true,
          agreements: {
            where: { isArchived: false },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              matricule: true,
              startDate: true,
              status: true,
              nbDaysOfTolerance: true,
              createdAt: true,
              payments: {
                where: {
                  type: 'income',
                  category: 'rent',
                  isArchived: false,
                },
                orderBy: {
                  paymentDate: 'desc',
                },
                take: 1,
              },
              apartment: {
                select: {
                  id: true,
                  address: true,
                  matricule: true,
                  type: true,
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
      this.prisma.tenant.count({ where: whereCriteria }),
    ]);

    const results = this.tenantsMapper.addStatusToTenants(tenants);

    return { meta: { page, limit, total }, tenants: results };
  }

  async findAllLatePayers({ searchTerm, limit, page }: TenantFindAllArgs) {
    const now = new Date();
    const firstDayOfCurrentMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      23,
      59,
    );
    const firstDayOfCurrentMonthWithTolerenceDays = new Date(
      firstDayOfCurrentMonth,
    );

    firstDayOfCurrentMonthWithTolerenceDays.setDate(
      firstDayOfCurrentMonth.getDate(),
    );

    const whereCriteria = {
      ...(searchTerm &&
        !isNaN(+searchTerm) && {
          OR: [
            { matricule: +searchTerm },
            { phoneNumber: { contains: searchTerm, mode: 'insensitive' } },
            { cin: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }),
      ...(searchTerm &&
        isNaN(+searchTerm) && {
          OR: [
            { fullname: { contains: searchTerm, mode: 'insensitive' } },
            { email: { contains: searchTerm, mode: 'insensitive' } },
            { address: { contains: searchTerm, mode: 'insensitive' } },
            { societyName: { contains: searchTerm, mode: 'insensitive' } },
          ],
        }),
      agreements: {
        some: {
          status: 'ACTIVE',
          isArchived: false,
          payments: {
            some: {}, // payments must NOT be empty
            none: {
              isArchived: false,
              type: 'income',
              rentStartDate: {
                gte: firstDayOfCurrentMonth,
              },
            },
          },
        },
      },
    } as Prisma.TenantWhereInput;

    const [tenants, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where: { isArchived: false, ...whereCriteria },
        select: {
          id: true,
          address: true,
          cin: true,
          email: true,
          firstname: true,
          lastname: true,
          fullname: true,
          phoneNumber: true,
          createdAt: true,
          gender: true,
          job: true,
          matricule: true,
          nationality: true,
          societyName: true,
          type: true,
          agreements: {
            where: { isArchived: false, status: 'ACTIVE' },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              matricule: true,
              startDate: true,
              status: true,
              nbDaysOfTolerance: true,
              rentAmount: true,
              createdAt: true,
              payments: {
                where: {
                  type: 'income',
                  category: 'rent',
                  isArchived: false,
                },
                orderBy: {
                  paymentDate: 'desc',
                },
                take: 1,
              },
              apartment: {
                select: {
                  id: true,
                  address: true,
                  matricule: true,
                  type: true,
                  property: {
                    select: {
                      address: true,
                      id: true,
                      matricule: true,
                      type: true,
                      owner: {
                        select: {
                          firstname: true,
                          lastname: true,
                          type: true,
                          fullname: true,
                          society: true,
                        },
                      },
                    },
                  },
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
      this.prisma.tenant.count({ where: whereCriteria }),
    ]);

    const results = tenants.map((item) => {
      let paymentDate: Date = item.agreements[0].startDate; // If no payments found, by default paymentDate is the startDate of rent agreement

      if (
        item.agreements.length &&
        item.agreements[0].payments.length &&
        item.agreements[0].payments[0].rentStartDate
      ) {
        paymentDate = item.agreements[0].payments[0].rentStartDate;
      }
      const paymentDelayInMonths = this.differenceInMonths(
        firstDayOfCurrentMonth,
        paymentDate,
      );

      return {
        ...item,
        paymentDelay: paymentDelayInMonths,
        overdueAmount:
          Number(item.agreements[0].rentAmount) * paymentDelayInMonths,
      };
    });

    return { meta: { page, limit, total }, tenants: results };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, isArchived: false },
      include: {
        agreements: {
          select: {
            id: true,
            matricule: true,
            startDate: true,
            status: true,
            nbDaysOfTolerance: true,
            rentAmount: true,
            createdAt: true,
            payments: {
              where: {
                type: 'income',
                category: 'rent',
                isArchived: false,
              },
              orderBy: {
                paymentDate: 'desc',
              },
              take: 1,
            },
            apartment: {
              select: {
                id: true,
                address: true,
                matricule: true,
                type: true,
                property: {
                  select: {
                    address: true,
                    id: true,
                    matricule: true,
                    type: true,
                    owner: {
                      select: {
                        firstname: true,
                        lastname: true,
                        type: true,
                        fullname: true,
                        society: true,
                      },
                    },
                  },
                },
              },
            },
          },
          where: { status: 'ACTIVE', isArchived: false },
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
        },
      },
    });
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDtoType) {
    await this.prisma.tenant.update({
      where: { id },
      data: {
        type: updateTenantDto.tenantType,
        phoneNumber: updateTenantDto.phoneNumber,
        address: updateTenantDto.address,
        cin: updateTenantDto.cin,
        firstname: updateTenantDto.firstname,
        lastname: updateTenantDto.lastname,
        societyName: updateTenantDto.societyName,
        job: updateTenantDto.job,
        email: updateTenantDto.email,
        nationality: updateTenantDto?.nationality,
        gender: updateTenantDto.gender,
        managerCin: updateTenantDto.managerCin,
        managerFirstname: updateTenantDto.managerFirstname,
        managerLastname: updateTenantDto.managerLastname,
        managerPhoneNumber: updateTenantDto.managerPhoneNumber,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.tenant.update({
      where: { id },
      data: { isArchived: true },
    });
  }

  differenceInMonths(date1: Date, date2: Date): number {
    return (
      (date1.getFullYear() - date2.getFullYear()) * 12 +
      (date1.getMonth() - date2.getMonth())
    );
  }
}
