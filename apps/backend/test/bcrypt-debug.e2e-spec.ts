import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

describe('Bcrypt Debug Test', () => {
  it('should test bcrypt hash and compare functionality', async () => {
    // Generate a token like the service does
    const token = crypto.randomBytes(32).toString('hex');
    console.log('Generated token:', token);
    console.log('Token type:', typeof token);
    console.log('Token length:', token.length);
    
    // Hash the token like the service does
    const hashedToken = await bcrypt.hash(token, 10);
    console.log('Hashed token:', hashedToken);
    console.log('Hashed token type:', typeof hashedToken);
    console.log('Hashed token length:', hashedToken.length);
    
    // Test bcrypt.compare
    try {
      const matches = await bcrypt.compare(token, hashedToken);
      console.log('Bcrypt compare result:', matches);
      expect(matches).toBe(true);
    } catch (error) {
      console.error('Bcrypt compare error:', error);
      throw error;
    }
  });
});