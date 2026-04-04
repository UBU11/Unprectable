import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const result = cn('base-class', isActive && 'active-class');
    expect(result).toBe('base-class active-class');
  });

  it('should filter out falsy values', () => {
    const result = cn('class1', false && 'class2', null, undefined, 'class3');
    expect(result).toBe('class1 class3');
  });

  it('should handle empty input', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle single class', () => {
    const result = cn('single-class');
    expect(result).toBe('single-class');
  });

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should handle conflicting classes
    const result = cn('p-4', 'p-6');
    expect(result).toBe('p-6');
  });

  it('should handle complex conditional expressions', () => {
    const isPrimary = true;
    const isDisabled = false;
    const size: 'sm' | 'md' | 'lg' = 'lg';

    const result = cn(
      'base-button',
      isPrimary ? 'bg-blue-500' : 'bg-gray-500',
      isDisabled && 'opacity-50 cursor-not-allowed',
      size === 'lg' && 'text-lg px-6 py-3'
    );
    expect(result).toBe('base-button bg-blue-500 text-lg px-6 py-3');
  });

  it('should handle object syntax with clsx', () => {
    const result = cn({
      'class-a': true,
      'class-b': false,
      'class-c': true,
    });
    expect(result).toBe('class-a class-c');
  });

  it('should handle array syntax', () => {
    const result = cn(['class1', 'class2'], 'class3');
    expect(result).toBe('class1 class2 class3');
  });

  it('should merge conflicting tailwind utilities', () => {
    const result = cn('text-sm font-bold', 'text-lg', 'font-normal');
    expect(result).toBe('text-lg font-normal');
  });

  it('should handle dark mode classes', () => {
    const result = cn('text-black dark:text-white bg-white dark:bg-black');
    expect(result).toBe('text-black dark:text-white bg-white dark:bg-black');
  });

  it('should preserve custom classes', () => {
    const result = cn('custom-class-1', 'custom-class-2');
    expect(result).toBe('custom-class-1 custom-class-2');
  });
});
