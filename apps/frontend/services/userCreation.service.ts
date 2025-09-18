import { User } from '../types';
import * as api from './api';
import { ErrorHandler } from '../utils/errorHandling';

export class UserCreationService {
  private static apiUrl = `${(import.meta as any).env?.VITE_API_URL || '/api'}/users`;

  static async createUser(userData: any): Promise<any> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static validateUserData(userData: any): boolean {
    // Basic validation - ensure required fields are present
    return userData && 
           userData.nisn && 
           userData.name && 
           userData.password && 
           userData.role;
  }

  static async checkUserExists(identifier: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.apiUrl}/exists/${identifier}`);
      return response.ok;
    } catch (error) {
      console.error('Error checking user existence:', error);
      return false;
    }
  }

  static generateUserCredentials(): any {
    // Generate default credentials structure
    return {
      temporaryPassword: Math.random().toString(36).slice(-8),
      mustChangePassword: true
    };
  }

  static async sendWelcomeEmail(userEmail: string): Promise<void> {
    try {
      await fetch(`${this.apiUrl}/welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail })
      });
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  static logUserCreation(userData: any): void {
    console.log('User created:', userData);
  }
}

export default UserCreationService;