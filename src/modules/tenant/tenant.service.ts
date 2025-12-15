import { Injectable } from '@nestjs/common';
import { CreateTenantDtoType } from './dto/create-tenant.dto';
import { UpdateTenantDtoType } from './dto/update-tenant.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { Prisma, Tenant } from 'generated/prisma';
import { TenantFindAllArgs } from './types/tenant.findAll.type';
import { TenantMapper } from './mappers/tenants.mapper';

@Injectable()
export class TenantService {
  constructor(
    private prisma: PrismaService,
    private tenantsMapper: TenantMapper,
  ) {}
  async create(createTenantDto: CreateTenantDtoType) {
    await this.prisma.tenant.create({
      data: {
        address: createTenantDto.address,
        cin: `${createTenantDto.cin}`,
        firstname: createTenantDto.firstname,
        lastname: createTenantDto.lastname,
        job: createTenantDto.job,
        email: createTenantDto.email,
        fullname: `${createTenantDto.firstname} ${createTenantDto.lastname}`,
        nationality: createTenantDto.nationality,
        phoneNumber: `${createTenantDto.phoneNumber}`,
        gender: createTenantDto.gender,
      },
    });
  }

  async findAll({
    searchTerm,
    agreementId,
    apartmentId,
    tenantAgreement,
    tenantProperty,
    statusTenant,
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
          ],
        }),
      ...(tenantAgreement &&
        !isNaN(+tenantAgreement) && {
          agreements: {
            some: { isArchived: false, matricule: Number(tenantAgreement) },
          },
        }),
      ...(tenantProperty &&
        !isNaN(+tenantProperty) && {
          agreements: {
            some: {
              isArchived: false,
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
        agreements: { some: { id: agreementId } },
      }),
      ...(apartmentId && {
        agreements: { some: { apartment: { id: apartmentId } } },
      }),
      ...(statusTenant &&
        statusTenant === 'latePayers' && {
          agreements: {
            some: {
              status: 'ACTIVE',
              isArchived: false,
              paymentFrequency: 'MONTHLY',
              expireDate: {
                gte: new Date(),
              },
              payments: {
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
              expireDate: true,
              status: true,
              nbDaysOfTolerance: true,
              createdAt: true,
              payments: {
                where: {
                  type: 'income',
                  isArchived: false,
                },
                orderBy: {
                  createdAt: 'desc',
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

    let results = this.tenantsMapper.addStatusToTenants(tenants);

    return { meta: { page, limit, total }, tenants: results };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, isArchived: false },
      include: {
        agreements: {
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
        phoneNumber: updateTenantDto.phoneNumber,
        address: updateTenantDto.address,
        cin: updateTenantDto.cin,
        firstname: updateTenantDto.firstname,
        lastname: updateTenantDto.lastname,
        job: updateTenantDto.job,
        email: updateTenantDto.email,
        nationality: updateTenantDto.nationality,
        gender: updateTenantDto.gender,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.tenant.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
