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
      },
    });
  }

  async findAll({ searchTerm, limit, page }: PropertyFindAllArgs) {
    const whereCriteria = {
      isArchived: false,
      ...(searchTerm && {
        OR: [{ address: { contains: searchTerm } }],
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
          address: true,
          createdAt: true,
          type: true,
          owner: true,
          matricule: true,
          apartments: true,
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
        apartments: true,
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
