import { Injectable } from '@nestjs/common';

@Injectable()
export class TenantMapper {
  constructor() {}

  addStatusToTenants(tenants: unknown) {
    if (!Array.isArray(tenants)) return [];

    const results = tenants.map((item) => {
      const agreement =
        item.agreements.length > 0 ? item.agreements[0] : undefined;
      const payment =
        item.agreements.length > 0
          ? item.agreements[0].payments.length > 0
            ? item.agreements[0].payments[0]
            : undefined
          : undefined;

      let status = 'IN_GOOD_STANDING';

      console.log(agreement);
      if (!agreement) {
        status = 'NO_AGREEMENT';
        return {
          ...item,
          status,
        };
      }

      if (!payment) {
        status = 'NO_PAYMENT';
        return {
          ...item,
          status,
        };
      }

      if (agreement?.status === 'TERMINATED') {
        status = 'TERMINATED';
        return {
          ...item,
          status,
        };
      }

      if (new Date(agreement?.expireDate) < new Date()) {
        status = 'AGREEMENT_EXPIRED';
        return {
          ...item,
          status,
        };
      }

      if (
        payment &&
        !this.isDateInCurrentMonth(new Date(payment.rentStartDate))
      ) {
        status = 'PAYMENT_DEFAULT';
        return {
          ...item,
          status,
        };
      }
      return {
        ...item,
        status,
      };
    });

    return results;
  }

  private isDateInCurrentMonth(date: Date) {
    const now = new Date();

    const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const endDate = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    return date >= startDate && date <= endDate;
  }
}
