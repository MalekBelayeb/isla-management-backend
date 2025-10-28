import { ApiProperty } from '@nestjs/swagger';
import { ApartmentType } from 'generated/prisma';
import { z } from 'zod';

export const updateApartmentDtoSchema = z.object({
  propertyId: z.string(),
  type: z.enum(ApartmentType).optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  rooms: z.number().optional().optional(),
});

export type UpdateApartmentDtoType = z.infer<typeof updateApartmentDtoSchema>;

// swagger doc
export class UpdateApartmentDtoApiBody {
  @ApiProperty({ example: 'address' })
  address: string;
  @ApiProperty({ example: 'villa' })
  type: ApartmentType;
  @ApiProperty({ example: '123-123-123' })
  propertyId: string;
  @ApiProperty({ example: 'description' })
  description: string;
  @ApiProperty({ example: 500 })
  price: number;
  @ApiProperty({ example: 3 })
  rooms: number;
}
