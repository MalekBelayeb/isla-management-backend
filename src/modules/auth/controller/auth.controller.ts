import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import {
  type LoginRequestDtoType,
  loginRequestDtoSchema,
  LoginRequestApiBody,
} from '../dto/requests/login.request.dto';
import { ZodValidationPipe } from 'src/core/pipes/zod.validation.pipe';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../service/auth.service';
import {
  RegisterRequestApiBody,
  registerRequestDtoSchema,
  type RegisterRequestDtoType,
} from '../dto/requests/register.request.dto';
import { ApiResponseDto } from 'src/core/models/api.response.dto';
import {
  LoginResponseApiBody,
  LoginResponseDto,
} from '../dto/response/login.response.dto';
import { AuthUser } from '../dto/response/register.response.dto';
import { config } from 'src/core/config';
import { type FastifyReply } from 'fastify';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  @Post('login')
  @UsePipes(new ZodValidationPipe(loginRequestDtoSchema))
  @ApiBody({
    type: LoginRequestApiBody,
    description: 'Login input body',
    required: true,
  })
  @ApiResponse({
    type: LoginResponseApiBody,
    status: HttpStatus.OK,
    description: 'User successfully logged in',
  })
  @HttpCode(200)
  async login(
    @Body() loginDto: LoginRequestDtoType,
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const data = await this.authService.login(loginDto);
    res.setCookie('Authentication', data.token, {
      httpOnly: true,
      secure: config.ENV == 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return {
      statusCode: 200,
      message: 'User successfully logged in',
      data,
    };
  }

  @Post('register')
  @UsePipes(new ZodValidationPipe(registerRequestDtoSchema))
  @ApiBody({
    type: RegisterRequestApiBody,
    description: 'Register input body',
    required: true,
  })
  async register(
    @Body() registerDto: RegisterRequestDtoType,
  ): Promise<ApiResponseDto<AuthUser>> {
    const user = await this.authService.register(registerDto);

    return {
      statusCode: 200,
      message: 'User created successfully',
      data: user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(
    @Res({ passthrough: true }) res: FastifyReply,
  ): Promise<ApiResponseDto<null>> {
    res.clearCookie('Authentication');

    return {
      statusCode: 200,
      message: 'User signed out successfully',
      data: null,
    };
  }
}
