import { Document, Types } from 'mongoose';
export type ClassDocument = Class & Document;
export declare class Class {
    _id: Types.ObjectId;
    name: string;
    headTeacherId?: Types.ObjectId;
    students?: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const ClassSchema: import("mongoose").Schema<Class, import("mongoose").Model<Class, any, any, any, Document<unknown, any, Class, any, {}> & Class & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Class, Document<unknown, {}, import("mongoose").FlatRecord<Class>, {}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & import("mongoose").FlatRecord<Class> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
//# sourceMappingURL=class.schema.d.ts.map