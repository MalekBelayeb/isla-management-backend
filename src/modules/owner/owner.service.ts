import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { type CreateOwnerDtoType } from './dto/create-owner.dto';
import { type UpdateOwnerDtoType } from './dto/update-owner.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import { OwnerFindAllArgs } from './types/owner.findAll.type';
import { Prisma } from 'generated/prisma';

@Injectable()
export class OwnerService {
  constructor(private prisma: PrismaService) {}
  async create(createOwnerDto: CreateOwnerDtoType) {
    try {
      const newOwner = await this.prisma.owner.create({
        data: {
          firstname: createOwnerDto.firstname,
          lastname: createOwnerDto.lastname,
          fullname: `${createOwnerDto.firstname} ${createOwnerDto.lastname}`,
          email: createOwnerDto.email,
          cin: createOwnerDto.cin,
          nationality: createOwnerDto.nationality,
          gender: createOwnerDto.gender,
          phoneNumber: createOwnerDto.phoneNumber,
          rib: createOwnerDto.rib,
          type: createOwnerDto.type,
        },
      });
      return newOwner;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async findAll({ searchTerm, limit, page }: OwnerFindAllArgs) {
    const whereCriteria = {
      isArchived: false,
      ...(searchTerm && {
        OR: [
          { fullname: { contains: searchTerm } },
          { email: { contains: searchTerm } },
          { phoneNumber: { contains: searchTerm } },
          { cin: { contains: searchTerm } },
        ],
      }),
    } as Prisma.OwnerWhereInput;
    const [owners, total] = await this.prisma.$transaction([
      this.prisma.owner.findMany({
        where: whereCriteria,
        ...(limit && { take: limit }),
        ...(page && { skip: (page - 1) * (limit ?? 0) }),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.owner.count({ where: whereCriteria }),
    ]);
    return { meta: { page, limit, total }, owners };
  }

  async findOne(id: string) {
    const owner = await this.prisma.owner.findFirst({
      where: { id, isArchived: false },
    });
    return owner;
  }

  async update(id: string, updateOwnerDto: UpdateOwnerDtoType) {
    const updatedOwner = await this.prisma.owner.update({
      where: { id },
      data: {
        firstname: updateOwnerDto.firstname,
        lastname: updateOwnerDto.lastname,
        email: updateOwnerDto.email,
        cin: updateOwnerDto.cin,
        nationality: updateOwnerDto.nationality,
        gender: updateOwnerDto.gender,
        phoneNumber: updateOwnerDto.phoneNumber,
        rib: updateOwnerDto.rib,
        type: updateOwnerDto.type,
      },
    });
    return updatedOwner;
  }

  async remove(id: string) {
    const deletedOwner = await this.prisma.owner.update({
      where: { id },
      data: {
        isArchived: true,
      },
    });

    return deletedOwner;
  }
}
