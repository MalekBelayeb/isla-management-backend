import { ApartmentType } from 'generated/prisma';

export type ApartmentFindAllArgs = {
  searchTerm?: string;
  type?: ApartmentType;
  limit?: number;
  page?: number;
};
