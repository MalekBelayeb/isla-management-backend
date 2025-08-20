import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { config } from 'src/core/config';
import { AuthService } from '../service/auth.service';
import { JwtPayload } from '../models/jwt-payload.model';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.EXPIRES_IN,
    });
  }
  async validate(payload: JwtPayload) {
    return await this.authService.validateUser(payload);
  }
}
