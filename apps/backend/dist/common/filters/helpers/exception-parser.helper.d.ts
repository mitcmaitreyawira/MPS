export declare class ExceptionParserHelper {
    static parseException(exception: unknown): {
        status: number;
        message: string;
        error: string;
        validationErrors?: string[];
    };
    private static parseHttpException;
    private static isMongoError;
    private static parseMongoError;
}
//# sourceMappingURL=exception-parser.helper.d.ts.map