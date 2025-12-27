export const defaultLimitValue = 50;
export const taxInPercentage = 19;

export const consts = {
  message: {
    error: 'Internal Server Error',
    failedLogin: 'Unable to login, wrong credentials',
    badRequest: 'Validation failed, unknown error',
    badDateRange:
      'Validation failed: the start date must be earlier than the end date',
    tenantAlreadyHasAgreement:
      'Validation failed: The tenant already has an active agreement',
    propertyNotFound: 'Validation failed: Property not found',
    paymentReceiptGenerationFailed: 'Generation failed: Payment receipt generation failed',
    agreementNotFound: 'Validation failed: Agreement not found',
    agreementSuspended: 'Validation failed: Agreement suspended',
    apartmentAlreadyHasAgreement:
      'Validation failed: The apartment already has an active agreement',
  },
};
