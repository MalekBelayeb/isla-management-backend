import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { UserController } from './modules/user/controller/user.controller';
import { UserService } from './modules/user/service/user.service';
import { UserModule } from './modules/user/user.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { HTTPLoggingInterceptor } from './core/interceptors/http.logging.interceptors';
import { PrismaService } from './infrastructure/prisma.infra';
import { OwnerModule } from './modules/owner/owner.module';
import { AgreementModule } from './modules/agreement/agreement.module';
import { ApartmentModule } from './modules/apartment/apartment.module';
import { PropertyModule } from './modules/property/property.module';
import { TenantModule } from './modules/tenant/tenant.module';
import { PaymentModule } from './modules/payment/payment.module';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [AuthModule, UserModule, OwnerModule, AgreementModule, ApartmentModule, PropertyModule, TenantModule, PaymentModule],
  controllers: [UserController],
  providers: [
    UserService,
    PrismaService,
    {
      provide: APP_INTERCEPTOR,
      useClass: HTTPLoggingInterceptor,
    },
  ],
})
export class AppModule {}
