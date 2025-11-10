import { ApiProperty } from '@nestjs/swagger';
import {
  PaymentCategory,
  PaymentMethodType,
  PaymentType,
} from 'generated/prisma';
import { z } from 'zod';
export const updatePaymentSchema = z.object({
  amount: z.coerce.number(),
  type: z.enum(PaymentType),
  method: z.enum(PaymentMethodType),
  category: z.enum(PaymentCategory),
  agreementId: z.string(),
  label: z.string(),
  paymentDate: z.coerce.date().optional(),
  notes: z.string().optional(),
});

export type UpdatePaymentDtoType = z.infer<typeof updatePaymentSchema>;

// swagger doc
export class UpdatePaymentDtoApiBody {
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
