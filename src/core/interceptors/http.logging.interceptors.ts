// Import required modules
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class HTTPLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP_REQUEST');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();

    const now = Date.now();
    const logMessage =
      `METHOD: ${req.method} | URL: ${req.url} | ` +
      `QUERY: ${JSON.stringify(req.query)} | PARAMS: ${JSON.stringify(req.params)} | BODY: ${JSON.stringify(req.body)} ` +
      `${Date.now() - now} ms`;

    return next.handle().pipe(
      tap(() => {
        req.url && this.logger.log(logMessage);
      }),
      catchError((error) => {
        req.url && this.logger.log(logMessage);
        throw error;
      }),
    );
  }
}
