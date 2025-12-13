import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UsePipes,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { TenantService } from './tenant.service';
import {
  CreateTenantDtoApiBody,
  createTenantDtoSchema,
  type CreateTenantDtoType,
} from './dto/create-tenant.dto';
import {
  UpdateTenantDtoApiBody,
  updateTenantDtoSchema,
  type UpdateTenantDtoType,
} from './dto/update-tenant.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';
import { ZodValidationPipe } from 'src/core/pipes/zod.validation.pipe';
import { ApiBody } from '@nestjs/swagger';
import { defaultLimitValue } from 'src/shared/contants/constants';

@Controller('api/tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createTenantDtoSchema))
  @ApiBody({ type: CreateTenantDtoApiBody, description: 'Create Tenant' })
  create(@Body() createTenantDto: CreateTenantDtoType) {
    return this.tenantService.create(createTenantDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('searchTerm') searchTerm?: string,
    @Query('apartmentId') apartmentId?: string,
    @Query('statusTenant') statusTenant?: string,
    @Query('agreementId') agreementId?: string,
    @Query('limit', new DefaultValuePipe(defaultLimitValue), ParseIntPipe)
    limit?: number,
    @Query('page') page?: number,
  ) {
    return this.tenantService.findAll({
      searchTerm,
      agreementId,
      apartmentId,
      statusTenant,
      limit,
      page,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateTenantDtoSchema))
  @ApiBody({ type: UpdateTenantDtoApiBody, description: 'Update Tenant' })
  update(
    @Param('id') id: string,
    @Body() updateTenantDto: UpdateTenantDtoType,
  ) {
    return this.tenantService.update(id, updateTenantDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tenantService.remove(id);
  }
}
