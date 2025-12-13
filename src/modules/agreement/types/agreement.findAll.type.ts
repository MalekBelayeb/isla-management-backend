export type AgreementFindAllArgs = {
  searchTerm?: string;
  apartmentId?: string;
  tenantId?: string;
  startDate?: string;
  endDate?: string;
  agreementStatus?: 'active' | 'expired' | 'suspended';
  limit?: number;
  page?: number;
};


