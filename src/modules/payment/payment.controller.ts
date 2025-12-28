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
  Res,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { PaymentService } from './services/payment.service';
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
import { PaymentType } from 'generated/prisma';
import { FinancialBalanceService } from './services/financial-balance.service';
import { PaymentReceiptGeneratorService } from './services/payment-receipt-generator.service';
import { type FastifyReply } from 'fastify';

@Controller('api/payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly financialBalanceService: FinancialBalanceService,
    private readonly paymentReceiptGeneratorService: PaymentReceiptGeneratorService,
  ) {}

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
    @Query('ownerId') ownerId?: string,
    @Query('paymentAgreement') paymentAgreement?: string,
    @Query('paymentProperty') paymentProperty?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('paymentType') paymentType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.paymentService.findAll({
      agreementId,
      apartmentId,
      tenantId,
      ownerId,
      paymentMethod,
      paymentType,
      paymentAgreement,
      paymentProperty,
      startDate,
      endDate,
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
    @Query('paymentMethod') paymentMethod?: string,
    @Query('apartmentId') apartmentId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('type') type?: PaymentType,
  ) {
    return this.financialBalanceService.findFinancialBalance({
      ownerId,
      propertyId,
      startDate,
      endDate,
      agreementId,
      apartmentId,
      paymentMethod,
      type,
    });
  }

  @Get('generate-receipt/:id')
  @UseGuards(JwtAuthGuard)
  async generatePaymentReceipt(
    @Param('id') id: string,
    @Res() reply: FastifyReply,
  ) {
    console.log('qsdqsdsqd');
    const paymentReceiptDocx =
      await this.paymentReceiptGeneratorService.generatePaymentReceipt(id);
    reply
      //.header('content-type', 'application/pdf')
      .header(
        'content-type',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      )
      .header(
        'content-disposition',
        'attachment; filename="payment-receipt.docx"',
      )
      .send(paymentReceiptDocx);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string) {
    return this.paymentService.findOne(id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
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
