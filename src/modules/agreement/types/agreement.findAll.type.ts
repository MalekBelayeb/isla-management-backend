export type AgreementFindAllArgs = {
  searchTerm?: string;
  apartmentId?: string;
  tenantId?: string;
  agreementProperty?: string;
  startDate?: string;
  endDate?: string;
  tenantName?: string;
  apartmentAdress?: string;
  ownerName?: string;
  agreementStatus?: 'active' | 'expired' | 'suspended';
  limit?: number;
  page?: number;
};
