import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getUser(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id },
      omit: { password: true },
    });
    return user;
  }
}
