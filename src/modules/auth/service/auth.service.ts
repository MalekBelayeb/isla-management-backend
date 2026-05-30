import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LoginRequestDtoType } from '../dto/requests/login.request.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../models/jwt-payload.model';
import { RegisterRequestDtoType } from '../dto/requests/register.request.dto';
import { PrismaService } from '../../../infrastructure/prisma.service';
import { consts } from '../../../shared/contants/constants';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
  async login(loginDto: LoginRequestDtoType) {
    try {
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

      return {
        id: user.id,
        token: await this.jwtService.signAsync({ id: user.id }),
      };
    } catch (err) {
      console.log(err);
      return { token: '' };
    }
  }

  async register(registerDto: RegisterRequestDtoType) {
    try {
      const hashPassword = await bcrypt.hash(registerDto.password, 10);

      const newUser = await this.prisma.user.create({
        data: {
          firstname: registerDto.firstname,
          lastname: registerDto.lastname,
          email: registerDto.email,
          password: hashPassword,
        },
        omit: {
          password: true,
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
      select: { id: true },
    });
    return user;
  }
}
