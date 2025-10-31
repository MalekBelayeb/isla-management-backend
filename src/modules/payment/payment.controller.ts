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
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  CreatePaymentDtoApiBody,
  type CreatePaymentDtoType,
  createPaymentSchema,
} from './dto/create-payment.dto';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth-guard';
import { ZodValidationPipe } from 'src/core/pipes/zod.validation.pipe';
import { ApiBody } from '@nestjs/swagger';
import {
  UpdatePaymentDtoApiBody,
  type UpdatePaymentDtoType,
  updatePaymentSchema,
} from './dto/update-payment.dto';
import { defaultLimitValue } from 'src/shared/contants/constants';

@Controller('api/payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(createPaymentSchema))
  @ApiBody({ type: CreatePaymentDtoApiBody, description: 'Create Payment' })
  create(@Body() createPaymentDto: CreatePaymentDtoType) {
    return this.paymentService.create(createPaymentDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(
    @Query('limit', new DefaultValuePipe(defaultLimitValue), ParseIntPipe)
    limit?: number,
    @Query('page') page?: number,
    @Query('agreementId') agreementId?: string,
    @Query('apartmentId') apartmentId?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.paymentService.findAll({
      agreementId,
      apartmentId,
      tenantId,
      limit,
      page,
    });
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  findFinancialBalance(
    @Query('ownerId') ownerId?: string,
    @Query('propertyId') propertyId?: string,
    @Query('agreementId') agreementId?: string,
    @Query('apartmentId') apartmentId?: string,
  ) {
    return this.paymentService.findFinancialBalance(
      ownerId,
      propertyId,
      agreementId,
      apartmentId,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ZodValidationPipe(updatePaymentSchema))
  @ApiBody({ type: UpdatePaymentDtoApiBody, description: 'Update Payment' })
  update(
    @Param('id') id: string,
    @Body() updatePaymentDto: UpdatePaymentDtoType,
  ) {
    return this.paymentService.update(id, updatePaymentDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id') id: string) {
    return this.paymentService.remove(id);
  }
}
