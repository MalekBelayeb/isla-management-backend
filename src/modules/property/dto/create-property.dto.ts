import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from 'generated/prisma';
import { z } from 'zod';

export const createPropertyDtoSchema = z.object({
  address: z.string(),
  type: z.enum(PropertyType),
  profitInPercentage: z.number(),
  ownerId: z.string(),
});

export type CreatePropertyDtoType = z.infer<typeof createPropertyDtoSchema>;

// swagger doc
export class CreatePropertyDtoApiBody {
  @ApiProperty({ example: 'address' })
  address: string;
  @ApiProperty({ example: 'villa' })
  type: PropertyType;
  @ApiProperty({ example: '123-123-123' })
  ownerId: string;
}
