import { BadRequestException, ConflictException } from '@nestjs/common';
import { Model } from 'mongoose';
import { User } from '../../../database/schemas/user.schema';
import { VALIDATION_PATTERNS } from '../../../common/validation.constants';

/**
 * UserValidationHelper handles user-specific validation logic.
 * This follows the Single Responsibility Principle by separating validation concerns.
 */
export class UserValidationHelper {
  constructor(private userModel: Model<User>) {}
  /**
   * Validate MongoDB ObjectId format
   * @param id - The ID to validate
   * @throws {BadRequestException} When ID format is invalid
   */
  static validateUserId(id: string): void {
    if (!VALIDATION_PATTERNS.MONGO_ID.test(id)) {
      throw new BadRequestException('Invalid user ID format');
    }
  }

  /**
   * Validate that a user ID is provided
   * @param id - The ID to validate
   * @throws {BadRequestException} When ID is missing
   */
  static validateUserIdRequired(id: string): void {
    if (!id || id.trim() === '') {
      throw new BadRequestException('User ID is required');
    }
  }

  /**
   * Comprehensive user ID validation (required + format)
   * @param id - The ID to validate
   * @throws {BadRequestException} When ID is invalid
   */
  static validateUserIdComplete(id: string): void {
    this.validateUserIdRequired(id);
    this.validateUserId(id);
  }



  /**
   * Validate NISN uniqueness across the system - DISABLED
   * NISN field now accepts any value without restrictions
   * @param nisn - The NISN to validate
   * @param excludeUserId - Optional user ID to exclude from the check (for updates)
   */
  async validateNisnUniqueness(nisn: string, excludeUserId?: string): Promise<void> {
    // NISN uniqueness validation disabled - accepts any value
    return;
  }

  /**
   * Validate username uniqueness across the system
   * @param username - The username to validate
   * @param excludeUserId - Optional user ID to exclude from the check (for updates)
   * @throws {ConflictException} When username already exists
   */
  async validateUsernameUniqueness(username: string, excludeUserId?: string): Promise<void> {
    if (!username) return;

    const normalizedUsername = username.trim().toLowerCase();
    const query: any = { username: normalizedUsername };
    
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }

    const existingUser = await this.userModel.findOne(query).exec();
    if (existingUser) {
      throw new ConflictException('This username is already taken. The system will automatically generate a unique username based on the user\'s name and email.');
    }
  }

  /**
   * Comprehensive duplicate validation for all unique fields
   * @param nisn - The NISN to validate (optional)
   * @param username - The username to validate (optional)
   * @param excludeUserId - Optional user ID to exclude from the check (for updates)
   * @throws {ConflictException} When any duplicate is found
   */
  async validateAllUniqueness(
    nisn?: string,
    username?: string,
    excludeUserId?: string
  ): Promise<void> {
    // Run all validations in parallel for better performance
    const validationPromises: Promise<void>[] = [];

    if (nisn) {
      validationPromises.push(this.validateNisnUniqueness(nisn, excludeUserId));
    }

    if (username) {
      validationPromises.push(this.validateUsernameUniqueness(username, excludeUserId));
    }

    await Promise.all(validationPromises);
  }

  /**
   * Batch validation for multiple users (useful for bulk operations)
   * @param users - Array of user data to validate
   * @throws {ConflictException} When duplicates are found within the batch or in the database
   */
  async validateBatchUniqueness(users: Array<{ nisn?: string; username?: string }>): Promise<void> {
    // Check for duplicates within the batch
    const nisns = new Set<string>();
    const usernames = new Set<string>();

    for (const user of users) {
      if (user.nisn) {
        const normalizedNisn = user.nisn.trim();
        if (nisns.has(normalizedNisn)) {
          throw new ConflictException(`Duplicate NISN found in batch: ${user.nisn}`);
        }
        nisns.add(normalizedNisn);
      }

      if (user.username) {
        const normalizedUsername = user.username.trim().toLowerCase();
        if (usernames.has(normalizedUsername)) {
          throw new ConflictException(`Duplicate username found in batch: ${user.username}`);
        }
        usernames.add(normalizedUsername);
      }
    }

    // Check against database
    const validationPromises = users.map(user => 
      this.validateAllUniqueness(user.nisn, user.username)
    );

    await Promise.all(validationPromises);
  }
}