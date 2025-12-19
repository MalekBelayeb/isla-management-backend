import { PaymentType } from 'generated/prisma';

export type FinancialBalanceFindArgs = {
  ownerId?: string;
  propertyId?: string;
  startDate?: string;
  endDate?: string;
  agreementId?: string;
  apartmentId?: string;
  type?: PaymentType;
};
