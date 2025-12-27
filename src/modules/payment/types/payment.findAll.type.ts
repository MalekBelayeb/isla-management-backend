export type PaymentFindAllArgs = {
  agreementId?: string;
  apartmentId?: string;
  ownerId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  paymentProperty?: string;
  paymentAgreement?: string;
  paymentMethod?: string;
  paymentType?: string;
  limit?: number;
  page?: number;
};
