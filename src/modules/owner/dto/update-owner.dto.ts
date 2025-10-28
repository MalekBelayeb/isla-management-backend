import { ApiProperty } from '@nestjs/swagger';
import { z } from 'zod';
import { createOwnerDtoSchema } from './create-owner.dto';

export const updateOwnerDtoSchema = createOwnerDtoSchema.extend({});

export type UpdateOwnerDtoType = z.infer<typeof updateOwnerDtoSchema>;

// swagger doc
export class UpdateOwnerDtoApiBody {
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
  @ApiProperty({ example: 'TN' })
  nationality: string;
  @ApiProperty({ example: 'M' })
  gender: string;
  @ApiProperty({ example: '55123123' })
  rib: string;
  @ApiProperty({ example: 'natural' })
  type: 'natural' | 'legal';
}
