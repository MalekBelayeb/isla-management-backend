import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { CreateApartmentDtoType } from './dto/create-apartment.dto';
import { UpdateApartmentDtoType } from './dto/update-apartment.dto';
import { ApartmentType, Prisma } from 'generated/prisma';
import { ApartmentFindAllArgs } from './types/apartment.findAll.type';
import { ApartmentMapper } from './mapper/apartment.mapper';

@Injectable()
export class ApartmentService {
  constructor(
    private prismaService: PrismaService,
    private apartmentMapper: ApartmentMapper,
  ) {}
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

  async findAll({
    searchTerm,
    type,
    matricule,
    propertyMatricule,
    ownerId,
    propertyId,
    rentStatus,
    limit,
    page,
  }: ApartmentFindAllArgs) {
    const whereCriteria = {
      isArchived: false,
      ...(searchTerm &&
        isNaN(+searchTerm) && {
          OR: [{ address: { contains: searchTerm, mode: 'insensitive' } }],
        }),
      ...(searchTerm &&
        !isNaN(+searchTerm) && {
          OR: [{ matricule: Number(searchTerm) }],
        }),
      ...(type && {
        type,
      }),
      ...(matricule &&
        !isNaN(matricule) && {
          matricule: Number(matricule),
        }),
      ...(ownerId && {
        property: { ownerId },
      }),
      ...(propertyId && {
        propertyId,
      }),
      ...(propertyMatricule &&
        !isNaN(propertyMatricule) && {
          property: { matricule: Number(propertyMatricule) },
        }),
      ...(rentStatus &&
        rentStatus === 'rented' && {
          agreements: {
            some: {
              status: 'ACTIVE',
              isArchived: false,
            },
          },
        }),
      ...(rentStatus &&
        rentStatus === 'notRented' && {
          agreements: {
            none: {
              status: 'ACTIVE',
              isArchived: false,
            },
          },
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
          createdAt: true,
          agreements: {
            where: { isArchived: false },
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
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

    const results = this.apartmentMapper.addRentStatusToApartments(apartments);
    return { meta: { page, limit, total }, apartments: results };
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
        createdAt: true,
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
