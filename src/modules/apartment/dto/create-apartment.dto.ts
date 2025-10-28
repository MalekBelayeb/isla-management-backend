import { ApiProperty } from '@nestjs/swagger';
import { ApartmentType } from 'generated/prisma';
import { z } from 'zod';

export const createApartmentDtoSchema = z.object({
  propertyId: z.string(),
  type: z.enum(ApartmentType),
  address: z.string(),
  description: z.string(),
  rooms: z.number().optional(),
});

export type CreateApartmentDtoType = z.infer<typeof createApartmentDtoSchema>;

// swagger doc
export class CreateApartmentDtoApiBody {
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
