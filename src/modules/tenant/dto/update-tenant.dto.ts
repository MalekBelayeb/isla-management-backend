import { ApiProperty } from '@nestjs/swagger';
import {
  GenderType,
  NationalityType,
  PropertyType,
  TenantType,
} from '@prisma/client';
import { z } from 'zod';

export const updateTenantDtoSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  cin: z.string().optional(),
  tenantType: z.enum(TenantType).optional(),
  societyName: z.string().optional(),
  phoneNumber: z.string().optional(),
  nationality: z.enum(NationalityType).optional(),
  address: z.string().optional(),
  job: z.string().optional(),
  email: z.string().optional(),
  gender: z.enum(GenderType).optional(),
  label: z.string().optional().optional(),

  managerCin: z.string().optional(),
  managerFirstname: z.string().optional(),
  managerLastname: z.string().optional(),
  managerPhoneNumber: z.string().optional(),
});

export type UpdateTenantDtoType = z.infer<typeof updateTenantDtoSchema>;

// swagger doc
export class UpdateTenantDtoApiBody {
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
