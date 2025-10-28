import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { ApiResponseDto } from 'src/core/models/api.response.dto';
import { GetUserDto } from '../dto/get-user.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';
import { type FastifyRequest } from 'fastify';

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUser(
    @Req() req: FastifyRequest,
  ): Promise<ApiResponseDto<GetUserDto | null>> {
    const user = await this.userService.getUser(req.user?.id ?? '');
    console.log(user);
    return {
      statusCode: 200,
      message: 'User found successfully',
      data: user,
    };
  }
}
