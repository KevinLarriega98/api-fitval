import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { PlansModule } from './plans/plans.module';
import { ClassesModule } from './classes/classes.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TrainersModule } from './trainers/trainers.module';

@Module({
  imports: [
    DatabaseModule,
    PlansModule,
    ClassesModule,
    UsersModule,
    AuthModule,
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: 20 }],
      errorMessage: 'Demasiadas peticiones. Espera un poco.',
    }),
    TrainersModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
