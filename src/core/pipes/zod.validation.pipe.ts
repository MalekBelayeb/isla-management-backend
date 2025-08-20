import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { InvalidRequestException } from 'src/core/exceptions/invalid.request.exception';
import { consts } from 'src/shared/contants/constants';
import { ZodObject, ZodError } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      this.schema.parse(value);
      return value;
    } catch (error) {
      if (error instanceof ZodError) {
        throw new InvalidRequestException(error.message);
      }
      throw new BadRequestException(consts.message.badRequest);
    }
  }
}
