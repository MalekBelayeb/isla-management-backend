import { ApiProperty } from '@nestjs/swagger';
import { GenderType, NationalityType, PropertyType } from 'generated/prisma';
import { z } from 'zod';

export const createTenantDtoSchema = z.object({
  firstname: z.string(),
  lastname: z.string(),
  cin: z.coerce.string(),
  phoneNumber: z.coerce.string(),
  nationality: z.enum(NationalityType),
  gender: z.enum(GenderType),
  address: z.string().optional(),
  job: z.string().optional(),
  email: z.string().optional(),
  label: z.string().optional(),
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
