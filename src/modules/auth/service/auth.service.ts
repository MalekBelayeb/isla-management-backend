import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { LoginRequestDtoType } from '../dto/requests/login.request.dto';
import { PrismaService } from 'src/infrastructure/prisma.infra';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../models/jwt-payload.model';
import { RegisterRequestDtoType } from '../dto/requests/register.request.dto';
import { consts } from 'src/shared/contants/constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: LoginRequestDtoType) {
    const user = await this.prisma.user.findFirst({
      where: {
        email: loginDto.email,
      },
    });

    if (
      user === null ||
      !bcrypt.compareSync(loginDto.password, user.password)
    ) {
      throw new HttpException(
        consts.message.failedLogin,
        HttpStatus.UNAUTHORIZED,
      );
    }

    return this.jwtService.signAsync({ id: user.id });
  }

  async register(registerDto: RegisterRequestDtoType) {
    try {
      const hashPassword = await bcrypt.hash(registerDto.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          fullname: registerDto.fullname,
          email: registerDto.email,
          password: hashPassword,
        },
        select: {
          password: false,
          id: true,
          email: true,
          fullname: true,
        },
      });

      return newUser;
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  async validateUser(payload: JwtPayload) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
    });
    if (user !== null) return user;
    throw new UnauthorizedException();
  }
}
