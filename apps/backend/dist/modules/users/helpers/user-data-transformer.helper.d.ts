import { CreateUserDto, UpdateUserDto } from '../dto';
import { User } from '../../../database/schemas/user.schema';
export declare class UserDataTransformer {
    static transformCreateDto(createUserDto: CreateUserDto, hashedPassword: string): Partial<User>;
    static transformUpdateDto(updateUserDto: UpdateUserDto): Partial<User>;
    private static transformProfile;
    private static transformPreferences;
    static buildFilterQuery(query: any): any;
    static buildQueryOptions(query: any): {
        sort: any;
        skip: number;
        selectFields: string;
    };
}
//# sourceMappingURL=user-data-transformer.helper.d.ts.map