import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserController } from './modules/user/controller/user.controller';
import { UserService } from './modules/user/service/user.service';
import { UserModule } from './modules/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HTTPLoggingInterceptor } from './core/interceptors/http.logging.interceptors';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [AuthModule, UserModule],
  controllers: [UserController],
  providers: [
    UserService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HTTPLoggingInterceptor,
    },
  ],
})
export class AppModule {}
