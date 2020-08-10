/**
 * Table Utility Tests
 */

import { makeTableColumns } from '@/utils/table';

describe('table utilities', () => {
  it('should generate table columns', () => {
    const results = makeTableColumns([['key1'], ['key2'], ['key3']]);
    expect(results).toMatchInlineSnapshot(`
      Array [
        Object {
          "dataIndex": "key_1",
          "key": "key_1",
          "title": "Key 1",
          "width": "1fr",
        },
        Object {
          "dataIndex": "key_2",
          "key": "key_2",
          "title": "Key 2",
          "width": "1fr",
        },
        Object {
          "dataIndex": "key_3",
          "key": "key_3",
          "title": "Key 3",
          "width": "1fr",
        },
      ]
    `);
  });
  it('should allow overrides', () => {
    const results = makeTableColumns([
      ['key1', '0.5fr', 'Override Title'],
      ['key2', '1fr'],
      ['key3'],
    ]);
    expect(results).toMatchInlineSnapshot(`
      Array [
        Object {
          "dataIndex": "key_1",
          "key": "key_1",
          "title": "Override Title",
          "width": "0.5fr",
        },
        Object {
          "dataIndex": "key_2",
          "key": "key_2",
          "title": "Key 2",
          "width": "1fr",
        },
        Object {
          "dataIndex": "key_3",
          "key": "key_3",
          "title": "Key 3",
          "width": "1fr",
        },
      ]
    `);
  });
});
