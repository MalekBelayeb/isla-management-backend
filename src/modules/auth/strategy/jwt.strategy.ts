import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from 'src/core/config';
import { AuthService } from '../service/auth.service';
import { JwtPayload } from '../models/jwt-payload.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req?.cookies?.['Authentication'];
        },
      ]),
      ignoreExpiration: true,
      secretOrKey: config.JWT_SECRET,
    });
  }
  async validate(payload: JwtPayload) {
    const user = await this.authService.validateUser(payload);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
