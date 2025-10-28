import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from 'src/modules/auth/models/jwt-payload.model';

declare module 'fastify' {
  interface FastifyRequest {
    user?: JwtPayload;
  }
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
