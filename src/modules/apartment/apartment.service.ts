import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { CreateApartmentDtoType } from './dto/create-apartment.dto';
import { UpdateApartmentDtoType } from './dto/update-apartment.dto';
import { ApartmentType, Prisma } from 'generated/prisma';
import { ApartmentFindAllArgs } from './types/apartment.findAll.type';

@Injectable()
export class ApartmentService {
  constructor(private prismaService: PrismaService) {}
  async create(createApartmentDto: CreateApartmentDtoType) {
    await this.prismaService.apartment.create({
      data: {
        address: createApartmentDto.address,
        type: createApartmentDto.type,
        description: createApartmentDto.description,
        rooms: createApartmentDto.rooms,
        propertyId: createApartmentDto.propertyId,
      },
    });
  }

  async findAll({ searchTerm, type, limit, page }: ApartmentFindAllArgs) {
    const whereCriteria = {
      isArchived: false,
      ...(searchTerm && {
        OR: [{ address: { contains: searchTerm } }],
      }),
      ...(type && {
        type,
      }),
      ...(searchTerm &&
        !isNaN(+searchTerm) && {
          OR: [{ matricule: +searchTerm }],
        }),
    } as Prisma.ApartmentWhereInput;

    const [apartments, total] = await this.prismaService.$transaction([
      this.prismaService.apartment.findMany({
        where: whereCriteria,
        select: {
          id: true,
          address: true,
          matricule: true,
          price: true,
          rooms: true,
          type: true,
          description: true,
          property: {
            select: {
              id: true,
              address: true,
              matricule: true,
              owner: {
                select: {
                  id: true,
                  matricule: true,
                  gender: true,
                  fullname: true,
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
      this.prismaService.apartment.count({ where: whereCriteria }),
    ]);
    return { meta: { page, limit, total }, apartments };
  }

  async findOne(id: string) {
    return await this.prismaService.apartment.findFirst({
      where: { id, isArchived: false },
      select: {
        id: true,
        address: true,
        matricule: true,
        price: true,
        rooms: true,
        type: true,
        description: true,
        property: {
          select: {
            id: true,
            address: true,
            matricule: true,
            owner: {
              select: {
                id: true,
                matricule: true,
                gender: true,
                fullname: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateApartmentDto: UpdateApartmentDtoType) {
    await this.prismaService.apartment.update({
      where: { id },
      data: {
        address: updateApartmentDto.address,
        type: updateApartmentDto.type,
        description: updateApartmentDto.description,
        rooms: updateApartmentDto.rooms,
        propertyId: updateApartmentDto.propertyId,
      },
    });
  }

  async remove(id: string) {
    await this.prismaService.apartment.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
