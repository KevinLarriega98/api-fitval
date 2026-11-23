import { Module } from '@nestjs/common';
import { TrainersController } from './trainers.controller';
import { TrainersService } from './trainers.service';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { StaffGuard } from '../auth/staff.guard';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule],
  controllers: [TrainersController],
  providers: [TrainersService, StaffGuard],
})
export class TrainersModule {}
