import { Injectable } from '@nestjs/common';
import { CreateTenantDtoType } from './dto/create-tenant.dto';
import { UpdateTenantDtoType } from './dto/update-tenant.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { Prisma } from 'generated/prisma';
import { TenantFindAllArgs } from './types/tenant.findAll.type';

@Injectable()
export class TenantService {
  constructor(private prisma: PrismaService) {}
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

  async findAll({ searchTerm, limit, page }: TenantFindAllArgs) {
    const whereCriteria = {
      isArchived: false,
      ...(searchTerm &&
        !isNaN(+searchTerm) && {
          OR: [
            { matricule: +searchTerm },
            { phoneNumber: { contains: searchTerm } },
            { cin: { contains: searchTerm } },
          ],
        }),
      ...(searchTerm && {
        OR: [
          { fullname: { contains: searchTerm } },
          { email: { contains: searchTerm } },
        ],
      }),
    } as Prisma.TenantWhereInput;

    const [tenants, total] = await this.prisma.$transaction([
      this.prisma.tenant.findMany({
        where: whereCriteria,
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
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
            select: {
              id: true,
              matricule: true,
              startDate: true,
              createdAt: true,
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
    return { meta: { page, limit, total }, tenants };
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findFirst({
      where: { id, isArchived: false },
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
