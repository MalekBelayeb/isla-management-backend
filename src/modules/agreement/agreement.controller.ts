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
import { AgreementService } from './agreement.service';
import {
  CreateAgreementDtoApiBody,
  createAgreementSchema,
  type CreateAgreementDtoType,
} from './dto/create-agreement.dto';
import {
  UpdateAgreementDtoApiBody,
  updateAgreementSchema,
  type UpdateAgreementDtoType,
} from './dto/update-agreement.dto';
import { ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth-guard';
import { ZodValidationPipe } from 'nestjs-zod';
import { defaultLimitValue } from '../../shared/contants/constants';

@Controller('api/agreement')
export class AgreementController {
  constructor(private readonly agreementService: AgreementService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createAgreementSchema))
  @ApiBody({ type: CreateAgreementDtoApiBody, description: 'Create Agreement' })
  create(@Body() createAgreementDto: CreateAgreementDtoType) {
    return this.agreementService.create(createAgreementDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('searchTerm') searchTerm?: string,
    @Query('limit', new DefaultValuePipe(defaultLimitValue), ParseIntPipe)
    limit?: number,
    @Query('apartmentId') apartmentId?: string,
    @Query('tenantId') tenantId?: string,
    @Query('agreementProperty') agreementProperty?: string,

    @Query('tenantName') tenantName?: string,
    @Query('apartmentAdress') apartmentAdress?: string,
    @Query('ownerName') ownerName?: string,

    @Query('agreementStatus')
    agreementStatus?: 'active' | 'expired' | 'suspended',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page?: number,
  ) {
    return this.agreementService.findAll({
      searchTerm,
      apartmentId,
      tenantId,
      agreementProperty,
      agreementStatus,
      tenantName,
      apartmentAdress,
      ownerName,
      startDate,
      endDate,
      limit,
      page,
    });
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.agreementService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updateAgreementSchema))
  @ApiBody({ type: UpdateAgreementDtoApiBody, description: 'Update Agreement' })
  update(
    @Param('id') id: string,
    @Body() updateAgreementDto: UpdateAgreementDtoType,
  ) {
    return this.agreementService.update(id, updateAgreementDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.agreementService.remove(id);
  }
}
