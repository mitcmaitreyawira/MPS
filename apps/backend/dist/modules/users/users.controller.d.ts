import { UsersService } from './users.service';
import { User } from '../../database/schemas/user.schema';
import { CreateUserDto, UpdateUserDto, QueryUsersDto } from './dto';
import { ErrorResponseService } from '../../common/services/error-response.service';
export declare class UsersController {
    private readonly usersService;
    private readonly errorResponseService;
    constructor(usersService: UsersService, errorResponseService: ErrorResponseService);
    findAll(query: QueryUsersDto): Promise<{
        users: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    findOne(id: string): Promise<User>;
    create(createUserDto: CreateUserDto): Promise<User>;
    createBulk(createUsersDto: {
        users: CreateUserDto[];
        adminVerificationCode?: string;
    }): Promise<{
        created: User[];
        errors: any[];
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
    remove(id: string): Promise<void>;
    archive(id: string): Promise<User>;
    restore(id: string): Promise<User>;
}
//# sourceMappingURL=users.controller.d.ts.map