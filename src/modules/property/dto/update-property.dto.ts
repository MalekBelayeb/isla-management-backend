import { PropertyType } from 'generated/prisma';
import z from 'zod';

export const updatePropertyDtoSchema = z.object({
  address: z.string().optional(),
  type: z.enum(PropertyType).optional(),
  ownerId: z.string(),
});

export type UpdatePropertyDtoType = z.infer<typeof updatePropertyDtoSchema>;
