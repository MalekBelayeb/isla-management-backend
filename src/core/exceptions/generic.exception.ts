import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { consts } from 'src/shared/contants/constants';
import { InvalidRequestException } from './invalid.request.exception';

@Catch()
export class GenericExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.BAD_REQUEST;
    let message: any = consts.message.error;
    let error: any;

    if (exception instanceof InvalidRequestException) {
      statusCode = exception.getStatus?.() ?? HttpStatus.BAD_REQUEST;
      error = exception.getResponse?.() ?? consts.message.error;
      message = consts.message.badRequest;
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus?.() ?? HttpStatus.BAD_REQUEST;
      message = exception.getResponse?.() ?? consts.message.error;
    }

    const responseBody = {
      statusCode,
      ...(error && { error }),
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(statusCode).send(responseBody);
  }
}
