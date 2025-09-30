import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('handles conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional');
      expect(cn('base', false && 'conditional')).toBe('base');
    });

    it('handles undefined and null', () => {
      expect(cn('base', undefined, null)).toBe('base');
    });

    it('merges tailwind classes correctly', () => {
      // tailwind-merge should handle conflicting classes
      expect(cn('px-2', 'px-4')).toBe('px-4');
    });
  });
});
