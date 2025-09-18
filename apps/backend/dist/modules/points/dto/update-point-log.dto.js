"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdatePointLogDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_point_log_dto_1 = require("./create-point-log.dto");
class UpdatePointLogDto extends (0, swagger_1.PartialType)(create_point_log_dto_1.CreatePointLogDto) {
}
exports.UpdatePointLogDto = UpdatePointLogDto;
//# sourceMappingURL=update-point-log.dto.js.map