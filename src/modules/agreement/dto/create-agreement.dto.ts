import { ApiProperty } from '@nestjs/swagger';
import { AgreementStatus, PaymentFrequency } from 'generated/prisma';
import { z } from 'zod';
export const createAgreementSchema = z.object({
  matricule: z.string(),
  rentAmount: z.number(),
  nbDaysOfTolerance: z.number(),
  startDate: z.coerce.date(),
  expireDate: z.coerce.date(),
  firstDayOfPayment: z.coerce.date().optional(),
  paymentFrequency: z.enum(PaymentFrequency),
  deposit: z.number().optional(),
  status: z.enum(AgreementStatus).optional(),
  notes: z.string().optional(),
  documentUrl: z.string().optional(),
  apartmentId: z.string(),
  tenantId: z.string(),
});

export type CreateAgreementDtoType = z.infer<typeof createAgreementSchema>;

// swagger doc
export class CreateAgreementDtoApiBody {
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
}
