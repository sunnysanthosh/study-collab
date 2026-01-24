import { describe, it, expect } from 'vitest';
import { validatePasswordStrength } from '../src/utils/password';

describe('validatePasswordStrength', () => {
  it('rejects passwords shorter than 8 chars', () => {
    const result = validatePasswordStrength('Ab1');
    expect(result.valid).toBe(false);
  });

  it('requires uppercase, lowercase, and number', () => {
    expect(validatePasswordStrength('password1').valid).toBe(false);
    expect(validatePasswordStrength('PASSWORD1').valid).toBe(false);
    expect(validatePasswordStrength('Password').valid).toBe(false);
  });

  it('accepts strong passwords', () => {
    const result = validatePasswordStrength('StrongPass1');
    expect(result.valid).toBe(true);
  });
});
