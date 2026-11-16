import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { StaffGuard } from '../auth/staff.guard';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';

@Module({
  imports: [DatabaseModule, UsersModule, AuthModule],
  controllers: [ClassesController],
  providers: [ClassesService, StaffGuard],
})
export class ClassesModule {}
