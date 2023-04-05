import { describe, expect, test } from 'vitest';

describe('Test Env', () => {
  test('should always be UTC', () => {
    expect(new Date().getTimezoneOffset()).toBe(0);
  });
});
