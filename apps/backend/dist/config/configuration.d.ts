declare const _default: () => {
    app: {
        env: string;
        port: number;
    };
    api: {
        prefix: string;
    };
    database: {
        uri: string;
    };
    redis: {
        host: string;
        port: number;
        password: string | undefined;
    };
    devlock: {
        enabled: boolean;
        lockTTL: number;
    };
    security: {
        bcryptRounds: number;
    };
    throttle: {
        ttl: number;
        limit: number;
    };
    upload: {
        maxFileSize: number;
        dest: string;
    };
    cache: {
        ttl: number;
    };
    swagger: {
        enable: boolean;
    };
};
export default _default;
//# sourceMappingURL=configuration.d.ts.map