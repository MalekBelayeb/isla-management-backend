import { ApiProperty } from '@nestjs/swagger';
import { GenderType, PropertyType } from 'generated/prisma';
import { z } from 'zod';

export const createTenantDtoSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  cin: z.string(),
  phoneNumber: z.string(),
  nationality: z.string(),
  address: z.string(),
  job: z.string(),
  email: z.string(),
  gender: z.enum(GenderType),
});

export type CreateTenantDtoType = z.infer<typeof createTenantDtoSchema>;

// swagger doc
export class CreateTenantDtoApiBody {
  @ApiProperty({ example: 'flen' })
  firstname: string;
  @ApiProperty({ example: 'ben foulen' })
  lastname: string;
  @ApiProperty({ example: '33669988' })
  cin: string;
  @ApiProperty({ example: '55331144' })
  phoneNumber: string;
  @ApiProperty({ example: 'TN' })
  nationality: string;
  @ApiProperty({ example: 'address' })
  address: PropertyType;
  @ApiProperty({ example: 'job example' })
  job: string;
  @ApiProperty({ example: 'email@example.com' })
  email: string;
  @ApiProperty({ example: 'M' })
  gender: string;
}
