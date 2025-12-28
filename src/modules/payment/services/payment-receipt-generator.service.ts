import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import path from 'path';
import * as fs from 'fs';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { PaymentReceiptContent } from '../types/payment-receipt.type';
import { consts } from 'src/shared/contants/constants';
import writtenNumber from 'written-number';
import { PrismaService } from 'src/infrastructure/prisma.infra';
//import libre from 'libreoffice-convert';
import docxPdf from 'docx-pdf';

@Injectable()
export class PaymentReceiptGeneratorService {
  constructor(private prisma: PrismaService) {}

  async generatePaymentReceipt(paymentId: string) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId },
      include: {
        agreement: {
          include: { tenant: true },
        },
      },
    });
    if (!payment) {
      throw new HttpException(
        consts.message.paymentReceiptGenerationFailed,
        HttpStatus.BAD_REQUEST,
      );
    }
    const paymentReceiptContent: PaymentReceiptContent = {
      amount: `${payment.amount} DT`,
      amountDesc: this.convertNumbersToWrittenForm(Number(payment.amount)),
      label: payment.label,
      paymentDate: this.formatDate(payment.paymentDate),
      rentPeriod: `${payment.rentStartDate ? this.formatDate(payment.rentStartDate) : ''} - ${payment.rentEndDate ? this.formatDate(payment.rentEndDate) : ''}`,
      tenant: `${payment.agreement?.tenant?.gender === 'M' ? 'Monsieur' : 'Madame'} ${payment.agreement?.tenant?.fullname}`,
    };
    return await this.buildPaymentReceipt(paymentReceiptContent);
  }
  private async buildPaymentReceipt(
    paymentReceiptContent: PaymentReceiptContent,
  ) {
    try {
      const templatePath = path.join(
        process.cwd(),
        'templates',
        'payment-receipt-template.docx',
      );
      const content = fs.readFileSync(templatePath, 'binary');
      const zip = new PizZip(content);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
      });

      doc.render(paymentReceiptContent);

      const docxBuffer = doc
        .getZip()
        .generate({ type: 'nodebuffer', compression: 'DEFLATE' });
      /*
      const docxFileName = `payment-receipt-${Date.now()}.docx`;
      const docxOutputPath = path.join(process.cwd(), 'output', docxFileName);

      fs.mkdirSync(path.dirname(docxOutputPath), { recursive: true });
      fs.writeFileSync(docxOutputPath, docxBuffer);

      console.log(`DOCX saved at: ${docxOutputPath}`);

      const pdfOutputPath = path.join(
        process.cwd(),
        'output',
        `payment-receipt-${Date.now()}.pdf`,
      );

      await this.convertDocxToPdfAsync(docxOutputPath, pdfOutputPath);
*/
      return docxBuffer;
    } catch (err) {
      console.log(err);
      throw new HttpException(
        consts.message.paymentReceiptGenerationFailed,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private convertDocxToPdfAsync(
    docxPath: string,
    pdfPath: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      docxPdf(docxPath, pdfPath, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private convertNumbersToWrittenForm(amount: number): string {
    const dinarsValue = Math.floor(amount);
    const millimesValue = Math.round((amount - dinarsValue) * 1000);

    let dinarsWrittenForm = writtenNumber(dinarsValue, {
      lang: 'fr',
    }).toUpperCase();
    let millimesWrittenForm = writtenNumber(millimesValue, {
      lang: 'fr',
    }).toUpperCase();

    if (millimesValue <= 0) return `${dinarsWrittenForm} DINARS`;

    return `${dinarsWrittenForm} DINARS ET ${millimesWrittenForm} MILLIMES`;
  }

  formatDate(date: Date | string) {
    const d = new Date(date);

    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Tunis',
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    }).formatToParts(d);

    const month = parts.find((p) => p.type === 'month')!.value;
    const day = parts.find((p) => p.type === 'day')!.value;
    const year = parts.find((p) => p.type === 'year')!.value;

    return `${day}-${month}-${year}`;
  }
}
