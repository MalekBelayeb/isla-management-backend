import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidRequestException extends HttpException {
  constructor(cause: string) {
    super(cause, HttpStatus.BAD_REQUEST);
  }
}
