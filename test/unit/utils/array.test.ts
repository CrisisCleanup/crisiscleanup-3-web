import { describe, expect, test } from 'vitest';
import { groupBy, childrenBy } from '@/utils/array';

describe('utils > array', () => {
  test('groupBy', () => {
    const data = [
      { id: 1, name: 'John', age: 24, secretKey: null },
      { id: 2, name: 'Jane', age: 24, secretKey: null },
      { id: 3, name: null, age: 26, secretKey: null },
      { id: 4, name: 'John', age: 26, secretKey: null },
      { id: 5, name: null, age: 26, secretKey: null },
    ];
    const r1 = groupBy(data, 'name');
    const r2 = groupBy(data, 'secretKey');
    expect(r1).toMatchInlineSnapshot(`
      {
        "Jane": [
          {
            "age": 24,
            "id": 2,
            "name": "Jane",
            "secretKey": null,
          },
        ],
        "John": [
          {
            "age": 24,
            "id": 1,
            "name": "John",
            "secretKey": null,
          },
          {
            "age": 26,
            "id": 4,
            "name": "John",
            "secretKey": null,
          },
        ],
        "null": [
          {
            "age": 26,
            "id": 3,
            "name": null,
            "secretKey": null,
          },
          {
            "age": 26,
            "id": 5,
            "name": null,
            "secretKey": null,
          },
        ],
      }
    `);
    expect(r2).toMatchInlineSnapshot(`
      {
        "null": [
          {
            "age": 24,
            "id": 1,
            "name": "John",
            "secretKey": null,
          },
          {
            "age": 24,
            "id": 2,
            "name": "Jane",
            "secretKey": null,
          },
          {
            "age": 26,
            "id": 3,
            "name": null,
            "secretKey": null,
          },
          {
            "age": 26,
            "id": 4,
            "name": "John",
            "secretKey": null,
          },
          {
            "age": 26,
            "id": 5,
            "name": null,
            "secretKey": null,
          },
        ],
      }
    `);
  });

  test('childrenBy', () => {
    const data = {
      John: [
        { id: 1, name: 'John', age: 24 },
        { id: 4, name: 'John', age: 26 },
      ],
      Jane: [
        { id: 2, name: 'Jane', age: 24 },
        { id: 3, name: 'Jane', age: 26 },
      ],
      null: [
        { id: 5, name: null, age: 26 },
        { id: 6, name: null, age: 26 },
      ],
    };
    const r1 = childrenBy(data, 'age');
    expect(r1).toMatchInlineSnapshot(`
      [
        {
          "age": 26,
          "children": undefined,
          "id": 5,
          "name": null,
        },
        {
          "age": 26,
          "children": undefined,
          "id": 6,
          "name": null,
        },
      ]
    `);
  });
});
