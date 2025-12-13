import { Injectable } from '@nestjs/common';

@Injectable()
export class ApartmentMapper {
  constructor() {}

  addRentStatusToApartments(apartments: unknown) {
    if (!Array.isArray(apartments)) return [];
    const todayDate = new Date();
    todayDate.setHours(23, 59, 0, 0);

    return apartments.map((item) => {
      let rentStatus = '';
      const agreement =
        item.agreements.length > 0 ? item.agreements[0] : undefined;

      if (agreement && new Date(agreement?.expireDate) > todayDate) {
        rentStatus = 'rented';
      } else {
        rentStatus = 'notRented';
      }
      
      return {
        ...item,
        rentStatus,
      };
    });
  }
}
