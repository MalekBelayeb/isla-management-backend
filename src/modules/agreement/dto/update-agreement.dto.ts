import { ApiProperty } from '@nestjs/swagger';
import { AgreementStatus, PaymentFrequency } from 'generated/prisma';
import { z } from 'zod';
export const updateAgreementSchema = z.object({
  matricule: z.string(),
  rentAmount: z.coerce.number(),
  nbDaysOfTolerance: z.number(),
  paymentFrequency: z.enum(PaymentFrequency),
  startDate: z.coerce.date(),
  expireDate: z.coerce.date(),
  apartmentId: z.string(),
  tenantId: z.string(),
  status: z.enum(AgreementStatus).optional(),

  deposit: z.coerce.number().optional(),
  firstDayOfPayment: z.date().optional(),
  notes: z.string().optional(),
  documentUrl: z.string().optional(),

  terminatedAt: z.date().optional(),
  terminationReason: z.string().optional(),
});

export type UpdateAgreementDtoType = z.infer<typeof updateAgreementSchema>;

// swagger doc
export class UpdateAgreementDtoApiBody {
  @ApiProperty({ example: '12345' })
  matricule: string;
  @ApiProperty({ example: 50 })
  rentAmount: string;
  @ApiProperty({ example: 10 })
  nbDaysOfTolerance: number;
  @ApiProperty({ example: 20 })
  deposit: string;
  @ApiProperty({ example: '55331144' })
  firstDayOfPayment: string;
  @ApiProperty({ example: 'MONTHLY' })
  paymentFrequency: string;
  @ApiProperty({ example: new Date() })
  startDate: Date;
  @ApiProperty({ example: new Date() })
  expireDate: Date;
  @ApiProperty({ example: 'ACTIVE' })
  status: string;
  @ApiProperty({ example: '' })
  notes: string;
  @ApiProperty({ example: '' })
  documentUrl: string;
  @ApiProperty({ example: '' })
  apartmentId: string;
  @ApiProperty({ example: '' })
  tenantId: string;
  @ApiProperty({ example: new Date() })
  terminatedAt: Date;
  @ApiProperty({ example: '' })
  terminationReason: string;
}
