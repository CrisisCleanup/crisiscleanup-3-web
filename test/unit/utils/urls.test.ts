import { describe, expect, test } from 'vitest';
import { getQueryString } from '@/utils/urls';

describe('utils > urls', () => {
  test('getQueryString', () => {
    const d = {
      name: 'John',
      age: 24,
      address: {
        city: 'New York',
        country: 'USA',
      },
      isDeveloper: true,
      bio: 'Hello world',
    };
    const result = getQueryString(d);
    expect(result).toMatchInlineSnapshot(
      '"name=John&age=24&address=%5Bobject%20Object%5D&isDeveloper=true&bio=Hello%20world"',
    );
  });
});
