import { CreateAppealDto } from './create-appeal.dto';
import { AppealStatus } from '../entities/appeal.entity';
declare const UpdateAppealDto_base: import("@nestjs/common").Type<Partial<CreateAppealDto>>;
export declare class UpdateAppealDto extends UpdateAppealDto_base {
    status?: AppealStatus;
    reviewedBy?: string;
    reviewNotes?: string;
}
export {};
//# sourceMappingURL=update-appeal.dto.d.ts.map