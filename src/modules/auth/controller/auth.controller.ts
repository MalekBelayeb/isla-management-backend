import { Body, Controller, Post, UsePipes } from '@nestjs/common';
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
import { LoginResponseDto } from '../dto/response/login.response.dto';
import { AuthUser } from '../dto/response/register.response.dto';

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
    status: 200,
    description: 'User successfully logged in',
  })
  async login(
    @Body() loginDto: LoginRequestDtoType,
  ): Promise<ApiResponseDto<LoginResponseDto>> {
    const token = await this.authService.login(loginDto);

    return {
      statusCode: 200,
      message: 'User successfully logged in',
      data: { token },
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
}
