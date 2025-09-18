import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

/**
 * Custom decorator for optional email validation
 * Only validates email format if the value is provided and not empty
 */
export function IsOptionalEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isOptionalEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          // If value is undefined, null, or empty string, it's valid (optional)
          if (value === undefined || value === null || value === '') {
            return true;
          }
          
          // If value is provided, validate email format and length
          if (typeof value !== 'string') {
            return false;
          }
          
          // Check length (max 254 characters)
          if (value.length > 254) {
            return false;
          }
          
          // Validate email format
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return emailRegex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Please provide a valid email address';
        },
      },
    });
  };
}