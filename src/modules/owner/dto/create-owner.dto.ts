import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';

export const createOwnerDtoSchema = z.object({
  email: z.email().optional(),
  society: z.string().optional(),
  taxId: z.string().optional(),
  firstname: z.string(),
  lastname: z.string(),
  phoneNumber: z.string(),
  nationality: z.enum(['tn', 'dz', 'ly', 'others']),
  gender: z.enum(['M', 'F']).optional(),
  cin: z.string(),
  rib: z.string(),
  bank: z.string(),
  type: z.enum(['natural', 'legal']),
});

export type CreateOwnerDtoType = z.infer<typeof createOwnerDtoSchema>;

// swagger doc
export class CreateOwnerDtoApiBody {
  @ApiProperty({ example: 'test123@gmail.com' })
  email: string;
  @ApiProperty({ example: 'test123' })
  firstname: string;
  @ApiProperty({ example: 'test123' })
  lastname: string;
  @ApiProperty({ example: '55123123' })
  phoneNumber: string;
  @ApiProperty({ example: '55123123' })
  cin: string;
  @ApiProperty({ example: 'tn' })
  nationality: string;
  @ApiProperty({ example: 'M' })
  gender: string;
  @ApiProperty({ example: '55123123' })
  rib: string;
  @ApiProperty({ example: 'natural' })
  type: 'natural' | 'legal';
}
