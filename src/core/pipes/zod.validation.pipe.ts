import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { ZodObject, ZodError } from 'zod';
import { consts } from '../../shared/contants/constants';
import { InvalidRequestException } from '../exceptions/invalid.request.exception';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodObject<any>) {}

  transform(value: any, metadata: ArgumentMetadata) {
    try {
      if (metadata.type != 'body') {
        return value;
      }
      this.schema.parse(value);
      console.log(value);

      return value;
    } catch (error) {
      console.log(error);
      if (error instanceof ZodError) {
        throw new InvalidRequestException(error.message);
      }
      throw new BadRequestException(consts.message.badRequest);
    }
  }
}
