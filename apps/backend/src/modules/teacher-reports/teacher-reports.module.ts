import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TeacherReportsService } from './teacher-reports.service';
import { TeacherReportsController } from './teacher-reports.controller';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [JwtModule, CommonModule],
  controllers: [TeacherReportsController],
  providers: [TeacherReportsService],
  exports: [TeacherReportsService]
})
export class TeacherReportsModule {}