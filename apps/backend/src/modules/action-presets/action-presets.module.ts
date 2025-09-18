import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ActionPresetsService } from './action-presets.service';
import { ActionPresetsController } from './action-presets.controller';
import { ActionPreset, ActionPresetSchema } from '../../database/schemas/action-preset.schema';
import { CommonModule } from '../../common/common.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ActionPreset.name, schema: ActionPresetSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: {
          expiresIn: config.get<string>('jwt.expiresIn'),
        },
      }),
    }),
    CommonModule,
  ],
  controllers: [ActionPresetsController],
  providers: [
    ActionPresetsService,
  ],
  exports: [ActionPresetsService],
})
export class ActionPresetsModule {}