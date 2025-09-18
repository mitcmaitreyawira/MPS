import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClassesService } from './classes.service';
import { ClassesController } from './classes.controller';
import { Class, ClassSchema } from '../../database/schemas/class.schema';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Class.name, schema: ClassSchema }]),
    CommonModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get<string>('JWT_ACCESS_SECRET') || 'dev_access_secret',
        signOptions: {
          expiresIn: cfg.get<string>('JWT_ACCESS_EXPIRES_IN') || '1h',
        },
      }),
    }),
  ],
  controllers: [ClassesController],
  providers: [
    ClassesService,
  ],
  exports: [ClassesService],
})
export class ClassesModule {}