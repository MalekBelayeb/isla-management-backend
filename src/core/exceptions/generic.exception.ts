import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { InvalidRequestException } from './invalid.request.exception';
import { consts } from '../../shared/contants/constants';

@Catch()
export class GenericExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    let statusCode = HttpStatus.BAD_REQUEST;
    let message: string | object = consts.message.error;
    let error: string | object | undefined;

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
