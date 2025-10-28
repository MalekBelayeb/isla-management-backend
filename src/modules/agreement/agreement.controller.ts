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
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';
import { ZodValidationPipe } from 'src/core/pipes/zod.validation.pipe';
import { ApiBody } from '@nestjs/swagger';
import { defaultLimitValue } from 'src/shared/contants/constants';

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
    @Query('page') page?: number,
  ) {
    return this.agreementService.findAll({
      searchTerm,
      apartmentId,
      tenantId,
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
