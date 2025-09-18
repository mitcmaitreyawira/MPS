"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDataTransformer = void 0;
class UserDataTransformer {
    static transformCreateDto(createUserDto, hashedPassword) {
        const userData = {
            password: hashedPassword,
        };
        if (createUserDto.username && createUserDto.username.trim() !== '') {
            userData.username = createUserDto.username.trim();
        }
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
        if (createUserDto.profile) {
            userData.profile = this.transformProfile(createUserDto.profile);
        }
        if (createUserDto.preferences) {
            userData.preferences = this.transformPreferences(createUserDto.preferences);
        }
        return userData;
    }
    static transformUpdateDto(updateUserDto) {
        const updateData = {};
        if (updateUserDto.name !== undefined)
            updateData.name = updateUserDto.name;
        if (updateUserDto.points !== undefined)
            updateData.points = updateUserDto.points;
        if (updateUserDto.firstName !== undefined)
            updateData.firstName = updateUserDto.firstName;
        if (updateUserDto.lastName !== undefined)
            updateData.lastName = updateUserDto.lastName;
        if (updateUserDto.avatar !== undefined)
            updateData.avatar = updateUserDto.avatar;
        if (updateUserDto.roles !== undefined)
            updateData.roles = updateUserDto.roles;
        if (updateUserDto.classId !== undefined)
            updateData.classId = updateUserDto.classId;
        if (updateUserDto.profile) {
            updateData.profile = this.transformProfile(updateUserDto.profile);
        }
        if (updateUserDto.preferences) {
            updateData.preferences = this.transformPreferences(updateUserDto.preferences);
        }
        return updateData;
    }
    static transformProfile(profileDto) {
        const profile = {};
        if (profileDto.bio !== undefined)
            profile.bio = profileDto.bio;
        if (profileDto.phone !== undefined)
            profile.phone = profileDto.phone;
        if (profileDto.gender !== undefined)
            profile.gender = profileDto.gender;
        if (profileDto.subject !== undefined)
            profile.subject = profileDto.subject;
        if (profileDto.dateOfBirth !== undefined) {
            profile.dateOfBirth = profileDto.dateOfBirth ? new Date(profileDto.dateOfBirth) : undefined;
        }
        if (profileDto.address) {
            profile.address = {
                street: profileDto.address.street || '',
                city: profileDto.address.city || '',
                state: profileDto.address.state || '',
                zipCode: profileDto.address.zipCode || '',
                country: profileDto.address.country || '',
            };
        }
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
    static transformPreferences(preferencesDto) {
        const preferences = {};
        if (preferencesDto.theme !== undefined)
            preferences.theme = preferencesDto.theme;
        if (preferencesDto.language !== undefined)
            preferences.language = preferencesDto.language;
        if (preferencesDto.timezone !== undefined)
            preferences.timezone = preferencesDto.timezone;
        if (preferencesDto.pushNotifications) {
            preferences.pushNotifications = {
                enabled: preferencesDto.pushNotifications.enabled,
                sound: preferencesDto.pushNotifications.sound,
                vibration: preferencesDto.pushNotifications.vibration,
            };
        }
        return preferences;
    }
    static buildFilterQuery(query) {
        const filter = {};
        if (query.search) {
            filter.$or = [
                { firstName: { $regex: query.search, $options: 'i' } },
                { lastName: { $regex: query.search, $options: 'i' } },
                { nisn: { $regex: query.search, $options: 'i' } },
                { username: { $regex: query.search, $options: 'i' } },
            ];
        }
        if (query.role) {
            filter.roles = { $in: [query.role] };
        }
        if (query.classId) {
            filter.classId = query.classId;
        }
        if (!query.includeArchived) {
            filter.isArchived = { $ne: true };
        }
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
    static buildQueryOptions(query) {
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc', includeProfile = false, includePreferences = false, } = query;
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
        const skip = (page - 1) * limit;
        let selectFields = '-password';
        if (!includeProfile) {
            selectFields += ' -profile';
        }
        if (!includePreferences) {
            selectFields += ' -preferences';
        }
        return { sort, skip, selectFields };
    }
}
exports.UserDataTransformer = UserDataTransformer;
//# sourceMappingURL=user-data-transformer.helper.js.map