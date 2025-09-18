"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IsOptionalEmail = IsOptionalEmail;
const class_validator_1 = require("class-validator");
function IsOptionalEmail(validationOptions) {
    return function (object, propertyName) {
        (0, class_validator_1.registerDecorator)({
            name: 'isOptionalEmail',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            validator: {
                validate(value, args) {
                    if (value === undefined || value === null || value === '') {
                        return true;
                    }
                    if (typeof value !== 'string') {
                        return false;
                    }
                    if (value.length > 254) {
                        return false;
                    }
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(value);
                },
                defaultMessage(args) {
                    return 'Please provide a valid email address';
                },
            },
        });
    };
}
//# sourceMappingURL=optional-email.decorator.js.map