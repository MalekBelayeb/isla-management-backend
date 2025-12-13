import { ApartmentType } from 'generated/prisma';

export type ApartmentFindAllArgs = {
  searchTerm?: string;
  matricule?: number;
  propertyMatricule?: number;
  ownerId?: string;
  rentStatus?: string;
  type?: ApartmentType;
  limit?: number;
  page?: number;
};
