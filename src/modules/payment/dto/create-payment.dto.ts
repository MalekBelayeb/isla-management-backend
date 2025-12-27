import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentCategory,
  PaymentMethodType,
  PaymentType,
} from 'generated/prisma';
import { z } from 'zod';
export const createPaymentSchema = z.object({
  amount: z.coerce.number(),
  type: z.enum(PaymentType),
  category: z.enum(PaymentCategory),
  method: z.enum(PaymentMethodType),
  agreementId: z.string().optional(),
  matriculeProperty: z.number().optional(),
  label: z.string().optional(),
  rentStartDate: z.coerce.date().optional(),
  rentEndDate: z.coerce.date().optional(),
  paymentDate: z.coerce.date().optional(),
  tva: z.coerce.number().optional(),
  
  bank: z.string().optional(),
  checkNumber: z.string().optional(),
  transferNumber: z.string().optional(),

  notes: z.string().optional(),
});

export type CreatePaymentDtoType = z.infer<typeof createPaymentSchema>;

// swagger doc
export class CreatePaymentDtoApiBody {
  @ApiProperty({ example: '700' })
  amount: string;
  @ApiProperty({ example: 'deposit' })
  type: string;
  @ApiProperty({ example: 'cash' })
  method: string;
  @ApiProperty({ example: '12345' })
  agreementId: string;
  @ApiProperty({ example: '' })
  notes: string;
}
