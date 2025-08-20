import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/prisma.infra';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(id: number) {
    const user = await this.prisma.user.findFirst({ where: { id } });
  }
}
