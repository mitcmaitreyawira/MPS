import { CreateUserDto, UpdateUserDto } from '../dto';
import { User } from '../../../database/schemas/user.schema';

/**
 * UserDataTransformer handles the transformation of DTOs to database schema format.
 * This follows the Single Responsibility Principle by separating data transformation logic.
 */
export class UserDataTransformer {
  /**
   * Transform CreateUserDto to database schema format
   */
  static transformCreateDto(createUserDto: CreateUserDto, hashedPassword: string): Partial<User> {
    const userData: any = {
      password: hashedPassword,
    };

    // Add username if provided and not null/undefined/empty
    if (createUserDto.username && createUserDto.username.trim() !== '') {
      userData.username = createUserDto.username.trim();
    }

    // Only include optional fields if they are provided
    if (createUserDto.firstName) {
      userData.firstName = createUserDto.firstName;
    }
    if (createUserDto.lastName) {
      userData.lastName = createUserDto.lastName;
    }
    if (createUserDto.avatar) {
      userData.avatar = createUserDto.avatar;
    }
    if (createUserDto.nisn) {
      userData.nisn = createUserDto.nisn;
    }
    if (createUserDto.roles && createUserDto.roles.length > 0) {
      userData.roles = createUserDto.roles;
    }
    if (createUserDto.classId) {
      userData.classId = createUserDto.classId;
    }

    // Transform profile if provided
    if (createUserDto.profile) {
      userData.profile = this.transformProfile(createUserDto.profile);
    }

    // Transform preferences if provided
    if (createUserDto.preferences) {
      userData.preferences = this.transformPreferences(createUserDto.preferences);
    }

    return userData;
  }

  /**
   * Transform UpdateUserDto to database schema format
   */
  static transformUpdateDto(updateUserDto: UpdateUserDto): Partial<User> {
    const updateData: any = {};

    // Copy basic fields
    if (updateUserDto.name !== undefined) updateData.name = updateUserDto.name;
    if (updateUserDto.points !== undefined) updateData.points = updateUserDto.points;
    if (updateUserDto.firstName !== undefined) updateData.firstName = updateUserDto.firstName;
    if (updateUserDto.lastName !== undefined) updateData.lastName = updateUserDto.lastName;
    if (updateUserDto.avatar !== undefined) updateData.avatar = updateUserDto.avatar;
    if (updateUserDto.roles !== undefined) updateData.roles = updateUserDto.roles;
    if (updateUserDto.classId !== undefined) updateData.classId = updateUserDto.classId;

    // Transform profile if provided
    if (updateUserDto.profile) {
      updateData.profile = this.transformProfile(updateUserDto.profile);
    }

    // Transform preferences if provided
    if (updateUserDto.preferences) {
      updateData.preferences = this.transformPreferences(updateUserDto.preferences);
    }

    return updateData;
  }

  /**
   * Transform profile data from DTO to schema format
   */
  private static transformProfile(profileDto: any): any {
    const profile: any = {};
    
    if (profileDto.bio !== undefined) profile.bio = profileDto.bio;
    if (profileDto.phone !== undefined) profile.phone = profileDto.phone;
    if (profileDto.gender !== undefined) profile.gender = profileDto.gender;
    if (profileDto.subject !== undefined) profile.subject = profileDto.subject;
    if (profileDto.dateOfBirth !== undefined) {
      profile.dateOfBirth = profileDto.dateOfBirth ? new Date(profileDto.dateOfBirth) : undefined;
    }

    // Transform address if provided
    if (profileDto.address) {
      profile.address = {
        street: profileDto.address.street || '',
        city: profileDto.address.city || '',
        state: profileDto.address.state || '',
        zipCode: profileDto.address.zipCode || '',
        country: profileDto.address.country || '',
      };
    }

    // Transform social links if provided
    if (profileDto.socialLinks) {
      profile.socialLinks = {
        website: profileDto.socialLinks.website,
        linkedin: profileDto.socialLinks.linkedin,
        twitter: profileDto.socialLinks.twitter,
        github: profileDto.socialLinks.github,
      };
    }

    return profile;
  }

  /**
   * Transform preferences data from DTO to schema format
   */
  private static transformPreferences(preferencesDto: any): any {
    const preferences: any = {};
    
    if (preferencesDto.theme !== undefined) preferences.theme = preferencesDto.theme;
    if (preferencesDto.language !== undefined) preferences.language = preferencesDto.language;
    if (preferencesDto.timezone !== undefined) preferences.timezone = preferencesDto.timezone;



    // Transform push notifications if provided
    if (preferencesDto.pushNotifications) {
      preferences.pushNotifications = {
        enabled: preferencesDto.pushNotifications.enabled,
        sound: preferencesDto.pushNotifications.sound,
        vibration: preferencesDto.pushNotifications.vibration,
      };
    }

    return preferences;
  }

  /**
   * Build filter query for user search
   */
  static buildFilterQuery(query: any): any {
    const filter: any = {};

    // Search in name, nisn, and username fields
    if (query.search) {
      filter.$or = [
        { firstName: { $regex: query.search, $options: 'i' } },
        { lastName: { $regex: query.search, $options: 'i' } },
        { nisn: { $regex: query.search, $options: 'i' } },
        { username: { $regex: query.search, $options: 'i' } },
      ];
    }

    // Filter by role
    if (query.role) {
      filter.roles = { $in: [query.role] };
    }

    // Filter by class ID
    if (query.classId) {
      filter.classId = query.classId;
    }

    // Handle archived users - by default exclude archived unless explicitly requested
    if (!query.includeArchived) {
      filter.isArchived = { $ne: true };
    }

    // Handle soft-deleted users - by default exclude deleted unless explicitly requested
    if (!query.includeDeleted) {
      filter.deletedAt = { $eq: null };
    }

    // Date filters
    if (query.createdAfter || query.createdBefore) {
      filter.createdAt = {};
      if (query.createdAfter) {
        filter.createdAt.$gte = new Date(query.createdAfter);
      }
      if (query.createdBefore) {
        filter.createdAt.$lte = new Date(query.createdBefore);
      }
    }

    if (query.lastLoginAfter || query.lastLoginBefore) {
      filter.lastLoginAt = {};
      if (query.lastLoginAfter) {
        filter.lastLoginAt.$gte = new Date(query.lastLoginAfter);
      }
      if (query.lastLoginBefore) {
        filter.lastLoginAt.$lte = new Date(query.lastLoginBefore);
      }
    }

    return filter;
  }

  /**
   * Build query options for sorting, pagination, and field selection
   */
  static buildQueryOptions(query: any): { sort: any; skip: number; selectFields: string } {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      includeProfile = false,
      includePreferences = false,
    } = query;

    // Build sort object
    const sort: Record<string, 1 | -1> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build select fields
    let selectFields = '-password'; // Always exclude password
    if (!includeProfile) {
      selectFields += ' -profile';
    }
    if (!includePreferences) {
      selectFields += ' -preferences';
    }

    return { sort, skip, selectFields };
  }
}