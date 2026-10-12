export type FinancialOperationsFindArgs = {
  startDate?: string;
  endDate?: string;
  ownerId?: string;
  propertyId?: string;
  agreementId?: string;
  apartmentId?: string;
  paymentMethod?: string;
  type?: string;
  limit?: number;
  page?: number;
};
