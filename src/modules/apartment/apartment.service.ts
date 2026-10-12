import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateApartmentDtoType } from './dto/create-apartment.dto';
import { UpdateApartmentDtoType } from './dto/update-apartment.dto';
import { Prisma } from '@prisma/client';
import { ApartmentFindAllArgs } from './types/apartment.findAll.type';
import { ApartmentMapper } from './mapper/apartment.mapper';
import { PrismaService } from '../../infrastructure/prisma.service';
import { consts } from 'src/shared/contants/constants';

@Injectable()
export class ApartmentService {
  constructor(
    private prismaService: PrismaService,
    private apartmentMapper: ApartmentMapper,
  ) {}
  async create(createApartmentDto: CreateApartmentDtoType) {
    const property = await this.prismaService.property.findFirst({
      where: { id: createApartmentDto.propertyId, isArchived: false },
      include: { apartments: true },
    });

    if (!property) {
      throw new HttpException(
        consts.message.propertyNotFound,
        HttpStatus.BAD_REQUEST,
      );
    }

    const matricule = `${property.matricule}-${property.apartments.length + 1}`;

    await this.prismaService.apartment.create({
      data: {
        matricule,
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
                  type: true,
                  society: true,
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
                society: true,
                type: true,
                firstname: true,
                lastname: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateApartmentDto: UpdateApartmentDtoType) {
    this.recalculateApartmentMatricules(updateApartmentDto.propertyId);

    const apartment = await this.prismaService.apartment.findFirst({
      where: { id, isArchived: false },
    });

    if (!apartment) {
      throw new HttpException(
        consts.message.apartmentNotFound,
        HttpStatus.BAD_REQUEST,
      );
    }

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

  private async recalculateApartmentMatricules(propertyId: string) {
    const property = await this.prismaService.property.findUnique({
      where: { id: propertyId },
      select: {
        matricule: true,
        apartments: {
          where: { isArchived: false },
          orderBy: { createdAt: 'asc' },
          select: { id: true },
        },
      },
    });

    if (!property) {
      throw new HttpException(
        consts.message.propertyNotFound,
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.prismaService.$transaction(
      property.apartments.map((apartment, index) =>
        this.prismaService.apartment.update({
          where: { id: apartment.id },
          data: {
            matricule: `${property.matricule}-${index + 1}`,
          },
        }),
      ),
    );
  }

  async remove(id: string) {
    await this.prismaService.apartment.update({
      where: { id },
      data: { isArchived: true },
    });
  }
}
