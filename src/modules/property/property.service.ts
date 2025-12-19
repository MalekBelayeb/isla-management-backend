import { Injectable } from '@nestjs/common';
import { CreatePropertyDtoType } from './dto/create-property.dto';
import { type UpdatePropertyDtoType } from './dto/update-property.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { PropertyFindAllArgs } from './types/property.findAll.type';
import { Prisma } from 'generated/prisma';

@Injectable()
export class PropertyService {
  constructor(private prisma: PrismaService) {}
  async create(createPropertyDto: CreatePropertyDtoType) {
    await this.prisma.property.create({
      data: {
        address: createPropertyDto.address,
        type: createPropertyDto.type,
        ownerId: createPropertyDto.ownerId,
        profitInPercentage: createPropertyDto.profitInPercentage,
      },
    });
  }

  async findAll({
    searchTerm,
    ownerId,
    type,
    matricule,
    limit,
    page,
  }: PropertyFindAllArgs) {
    const whereCriteria = {
      isArchived: false,
      ...(searchTerm && {
        OR: [{ address: { contains: searchTerm, mode: 'insensitive' } }],
      }),
      ...(ownerId && {
        ownerId,
      }),
      ...(type && {
        type,
      }),
      ...(matricule &&
        !isNaN(matricule) && {
          matricule: Number(matricule),
        }),
      ...(searchTerm &&
        !isNaN(+searchTerm) && {
          OR: [{ matricule: +searchTerm }],
        }),
    } as Prisma.PropertyWhereInput;
    const [properties, total] = await this.prisma.$transaction([
      this.prisma.property.findMany({
        where: whereCriteria,
        select: {
          id: true,
          apartments: {
            select: {
              address: true,
              matricule: true,
            },
            where: { isArchived: false },
          },
          address: true,
          profitInPercentage: true,
          createdAt: true,
          type: true,
          owner: true,
          matricule: true,
        },
        ...(limit && { take: limit }),
        ...(page && { skip: (page - 1) * (limit ?? 0) }),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.property.count({ where: whereCriteria }),
    ]);
    return { meta: { page, limit, total }, properties };
  }

  async findOne(id: string) {
    const property = await this.prisma.property.findFirst({
      where: { id, isArchived: false },
      select: {
        id: true,
        address: true,
        createdAt: true,
        type: true,
        owner: true,
        matricule: true,
        apartments: true,
        profitInPercentage: true,
      },
    });
    return property;
  }

  async update(id: string, updatePropertyDto: UpdatePropertyDtoType) {
    await this.prisma.property.update({
      where: { id },
      data: {
        address: updatePropertyDto.address,
        ownerId: updatePropertyDto.ownerId,
        type: updatePropertyDto.type,
        profitInPercentage: updatePropertyDto.profitInPercentage,
      },
    });
  }

  async remove(id: string) {
    await this.prisma.property.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
