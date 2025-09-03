import { describe, it, expect } from 'vitest';

// Validation utilities
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  
  if (!/[A-Za-z]/.test(password)) {
    errors.push('Password must contain at least one letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateUsername = (username: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  
  if (username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and hyphens');
  }
  
  if (/^[_-]/.test(username) || /[_-]$/.test(username)) {
    errors.push('Username cannot start or end with underscore or hyphen');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validateAdventureTitle = (title: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!title.trim()) {
    errors.push('Title is required');
  }
  
  if (title.length > 100) {
    errors.push('Title must be less than 100 characters');
  }
  
  if (title.trim().length < 3) {
    errors.push('Title must be at least 3 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validatePartyLevel = (level: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Number.isInteger(level)) {
    errors.push('Level must be a whole number');
  }
  
  if (level < 1) {
    errors.push('Level must be at least 1');
  }
  
  if (level > 20) {
    errors.push('Level must be 20 or less');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

const validatePartySize = (size: number): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!Number.isInteger(size)) {
    errors.push('Party size must be a whole number');
  }
  
  if (size < 1) {
    errors.push('Party size must be at least 1');
  }
  
  if (size > 8) {
    errors.push('Party size must be 8 or less');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

describe('Validation Utils', () => {
  describe('Email Validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'user123@test-domain.com'
      ];

      validEmails.forEach(email => {
        expect(validateEmail(email)).toBe(true);
      });
    });

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user@.com',
        'user@example',
        ''
      ];

      invalidEmails.forEach(email => {
        expect(validateEmail(email)).toBe(false);
      });
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords', () => {
      const strongPasswords = [
        'password123',
        'MySecure1',
        'test123456',
        'P@ssw0rd'
      ];

      strongPasswords.forEach(password => {
        const result = validatePassword(password);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject passwords that are too short', () => {
      const result = validatePassword('12345');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 6 characters long');
    });

    it('should reject passwords that are too long', () => {
      const longPassword = 'a'.repeat(129);
      const result = validatePassword(longPassword);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be less than 128 characters');
    });

    it('should reject passwords without letters', () => {
      const result = validatePassword('123456');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one letter');
    });

    it('should reject passwords without numbers', () => {
      const result = validatePassword('password');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should return multiple errors for weak passwords', () => {
      const result = validatePassword('abc');
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContain('Password must be at least 6 characters long');
      expect(result.errors).toContain('Password must contain at least one number');
    });
  });

  describe('Username Validation', () => {
    it('should validate correct usernames', () => {
      const validUsernames = [
        'user123',
        'test_user',
        'my-username',
        'User_Name-123'
      ];

      validUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject usernames that are too short', () => {
      const result = validateUsername('ab');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be at least 3 characters long');
    });

    it('should reject usernames that are too long', () => {
      const longUsername = 'a'.repeat(31);
      const result = validateUsername(longUsername);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Username must be less than 30 characters');
    });

    it('should reject usernames with invalid characters', () => {
      const invalidUsernames = [
        'user@name',
        'user name',
        'user#123',
        'user.name'
      ];

      invalidUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username can only contain letters, numbers, underscores, and hyphens');
      });
    });

    it('should reject usernames starting or ending with special characters', () => {
      const invalidUsernames = [
        '_username',
        'username_',
        '-username',
        'username-'
      ];

      invalidUsernames.forEach(username => {
        const result = validateUsername(username);
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain('Username cannot start or end with underscore or hyphen');
      });
    });
  });

  describe('Adventure Title Validation', () => {
    it('should validate correct titles', () => {
      const validTitles = [
        'The Dragon\'s Lair',
        'Mystery of the Haunted Mansion',
        'Epic Quest for the Golden Sword'
      ];

      validTitles.forEach(title => {
        const result = validateAdventureTitle(title);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject empty titles', () => {
      const result = validateAdventureTitle('');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject whitespace-only titles', () => {
      const result = validateAdventureTitle('   ');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
    });

    it('should reject titles that are too short', () => {
      const result = validateAdventureTitle('Hi');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be at least 3 characters long');
    });

    it('should reject titles that are too long', () => {
      const longTitle = 'a'.repeat(101);
      const result = validateAdventureTitle(longTitle);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title must be less than 100 characters');
    });
  });

  describe('Party Level Validation', () => {
    it('should validate correct levels', () => {
      const validLevels = [1, 5, 10, 15, 20];

      validLevels.forEach(level => {
        const result = validatePartyLevel(level);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject non-integer levels', () => {
      const result = validatePartyLevel(5.5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Level must be a whole number');
    });

    it('should reject levels below 1', () => {
      const result = validatePartyLevel(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Level must be at least 1');
    });

    it('should reject levels above 20', () => {
      const result = validatePartyLevel(21);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Level must be 20 or less');
    });
  });

  describe('Party Size Validation', () => {
    it('should validate correct party sizes', () => {
      const validSizes = [1, 2, 4, 6, 8];

      validSizes.forEach(size => {
        const result = validatePartySize(size);
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
    });

    it('should reject non-integer sizes', () => {
      const result = validatePartySize(4.5);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Party size must be a whole number');
    });

    it('should reject sizes below 1', () => {
      const result = validatePartySize(0);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Party size must be at least 1');
    });

    it('should reject sizes above 8', () => {
      const result = validatePartySize(9);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Party size must be 8 or less');
    });
  });

  describe('Combined Validation', () => {
    it('should validate complete user registration data', () => {
      const userData = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123'
      };

      const emailValid = validateEmail(userData.email);
      const usernameResult = validateUsername(userData.username);
      const passwordResult = validatePassword(userData.password);

      expect(emailValid).toBe(true);
      expect(usernameResult.isValid).toBe(true);
      expect(passwordResult.isValid).toBe(true);
    });

    it('should validate complete adventure generation data', () => {
      const adventureData = {
        title: 'The Dragon\'s Lair',
        level: 5,
        partySize: 4
      };

      const titleResult = validateAdventureTitle(adventureData.title);
      const levelResult = validatePartyLevel(adventureData.level);
      const sizeResult = validatePartySize(adventureData.partySize);

      expect(titleResult.isValid).toBe(true);
      expect(levelResult.isValid).toBe(true);
      expect(sizeResult.isValid).toBe(true);
    });
  });
});