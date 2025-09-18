import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { QueryClassesDto } from './dto/query-classes.dto';
export declare class ClassesController {
    private readonly classesService;
    constructor(classesService: ClassesService);
    create(createClassDto: CreateClassDto): Promise<import("../../database/schemas/class.schema").Class>;
    findAll(query: QueryClassesDto): Promise<{
        classes: import("../../database/schemas/class.schema").Class[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<import("../../database/schemas/class.schema").Class>;
    update(id: string, updateClassDto: UpdateClassDto): Promise<import("../../database/schemas/class.schema").Class>;
    remove(id: string): Promise<void>;
}
//# sourceMappingURL=classes.controller.d.ts.map