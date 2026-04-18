import { validatePasswordStrength, generateRandomString, formatFileSize, validateEmail } from './index'

describe('Utils', () => {
  describe('validatePasswordStrength', () => {
    test('should return false for weak passwords', () => {
      expect(validatePasswordStrength('password')).toBe(false)
      expect(validatePasswordStrength('12345678')).toBe(false)
      expect(validatePasswordStrength('PASSWORD123')).toBe(false)
      expect(validatePasswordStrength('Pass123')).toBe(false)
    })

    test('should return true for strong passwords', () => {
      expect(validatePasswordStrength('Password123!')).toBe(true)
      expect(validatePasswordStrength('Str0ngP@ssw0rd')).toBe(true)
      expect(validatePasswordStrength('C0mpl3xP@ss')).toBe(true)
    })
  })

  describe('generateRandomString', () => {
    test('should generate a string of the specified length', () => {
      const length = 10
      const result = generateRandomString(length)
      expect(typeof result).toBe('string')
      expect(result.length).toBe(length)
    })

    test('should generate different strings on subsequent calls', () => {
      const result1 = generateRandomString(10)
      const result2 = generateRandomString(10)
      expect(result1).not.toBe(result2)
    })
  })

  describe('formatFileSize', () => {
    test('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 Bytes')
      expect(formatFileSize(1000)).toBe('1000 Bytes')
      expect(formatFileSize(1024)).toBe('1 KB')
      expect(formatFileSize(1024 * 1024)).toBe('1 MB')
      expect(formatFileSize(1024 * 1024 * 1024)).toBe('1 GB')
    })

    test('should handle decimal values correctly', () => {
      expect(formatFileSize(1500)).toBe('1.46 KB')
      expect(formatFileSize(1500 * 1024)).toBe('1.46 MB')
    })
  })

  describe('validateEmail', () => {
    test('should return false for invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false)
      expect(validateEmail('invalid@')).toBe(false)
      expect(validateEmail('invalid@domain')).toBe(false)
      expect(validateEmail('invalid@domain.')).toBe(false)
    })

    test('should return true for valid emails', () => {
      expect(validateEmail('user@example.com')).toBe(true)
      expect(validateEmail('user.name@example.com')).toBe(true)
      expect(validateEmail('user_name@example.com')).toBe(true)
      expect(validateEmail('user-name@example.com')).toBe(true)
    })
  })
})
