import { describe, expect, test } from 'vitest';
import { faker } from '@faker-js/faker';
import { generateMockIncident, generateMockUser } from '../../helpers';
import { groupBy, buildForm, nest, nestUsers, EMAIL_REGEX } from '@/utils/form';

describe('utils > urls', () => {
  const data = [
    { id: 1, name: 'John', age: 24, secretKey: null },
    { id: 2, name: 'Jane', age: 24, secretKey: null },
    { id: 3, name: 'John', age: 26, secretKey: null },
    { id: 4, name: 'John', age: 26, secretKey: null },
    { id: 5, name: 'Jack', age: 26, secretKey: null },
  ];

  test('groupBy', () => {
    expect(groupBy('secretKey')(data)).toMatchInlineSnapshot(`
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
            "name": "John",
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
            "name": "Jack",
            "secretKey": null,
          },
        ],
      }
    `);
    expect(groupBy('name')(data)).toMatchInlineSnapshot(`
      {
        "Jack": [
          {
            "age": 26,
            "id": 5,
            "name": "Jack",
            "secretKey": null,
          },
        ],
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
            "id": 3,
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
      }
    `);
  });

  test('buildForm', () => {
    const seed = faker.seed(345);
    console.log('Running with faker seed', seed);
    const mockIncident = generateMockIncident();
    const mockFormFields = mockIncident.form_fields;
    const grouped = groupBy('field_parent_key')(mockFormFields);
    const r = [] as Array<Record<string, any>>;
    // Grouped items might be grouped by null if field_parent_key is null
    // see test for form > groupBy
    buildForm('null', grouped, r);
    expect(r).toMatchSnapshot();
  });

  test('nest', () => {
    const data = [
      { id: 1, name: 'Abc1', field_parent_key: 'a1', field_key: 'aa1' },
      { id: 2, name: 'Abc2', field_parent_key: 'a1', field_key: 'aa2' },
      { id: 3, name: 'Abc3', field_parent_key: 'a1', field_key: 'aa3' },
      { id: 4, name: 'Abc4', field_parent_key: null, field_key: 'aa4' },
      { id: 5, name: 'Abc5', field_parent_key: null, field_key: 'aa5' },
      { id: 6, name: 'Abc6', field_parent_key: null, field_key: 'aa6' },
      { id: 7, name: 'Abc7', field_parent_key: 'a2', field_key: 'aa7' },
      { id: 8, name: 'Abc8', field_parent_key: 'a2', field_key: 'aa8' },
    ];
    const r1 = nest(data);
    const r2 = nest(data, 'a2', 'field_parent_key', ['field_key', 'name']);
    const r3 = nest(data, 'a1');
    expect(r1).toMatchSnapshot();
    expect(r2).toMatchSnapshot();
    expect(r3).toMatchSnapshot();
  });

  test('nestUsers', () => {
    const seed = faker.seed(456);
    console.log('Running with faker seed', seed);
    const _data = Array.from({ length: 4 }, generateMockUser);
    // set id and referring_user to test nesting
    const data = _data.map((d, i) => ({
      ...d,
      id: i + 1,
      referring_user: i === 0 ? null : i,
    }));
    const r = nestUsers(data, 1);
    expect(r).toMatchSnapshot();
  });

  // TODO: Improve email regex and make this test pass
  test.fails('EMAIL_REGEX', () => {
    // See: https://gist.github.com/cjaoude/fd9910626629b53c4d25
    // See: http://www.ex-parrot.com/pdw/Mail-RFC822-Address.html
    const emailRegex = EMAIL_REGEX;
    const validEmails = [
      'email@example.com',
      'firstname.lastname@example.com',
      'email@subdomain.example.com',
      'firstname+lastname@example.com',
      'email@123.123.123.123',
      'email@[123.123.123.123]',
      '“email”@example.com',
      '1234567890@example.com',
      'email@example-one.com',
      '_______@example.com',
      'email@example.name',
      'email@example.museum',
      'email@example.co.jp',
      'firstname-lastname@example.com',
    ];
    const invalidEmails = [
      'plainaddress',
      '#@%^%#$@#$@#.com',
      '@example.com',
      'Joe Smith <email@example.com>',
      'email.example.com',
      'email@example@example.com',
      '.email@example.com',
      'email.@example.com',
      'email..email@example.com',
      'あいうえお@example.com',
      'email@example.com (Joe Smith)',
      'email@example',
      'email@-example.com',
      'email@example.web',
      'email@111.222.333.44444',
      'email@example..com',
      'Abc..123@example.com',
    ];

    // array snapshot for valid emails (should be true)
    // TODO: improve regex to match all valid emails
    expect(validEmails.map((email) => [email, emailRegex.test(email)]))
      .toMatchInlineSnapshot(`
        [
          [
            "email@example.com",
            true,
          ],
          [
            "firstname.lastname@example.com",
            true,
          ],
          [
            "email@subdomain.example.com",
            true,
          ],
          [
            "firstname+lastname@example.com",
            true,
          ],
          [
            "email@123.123.123.123",
            true,
          ],
          [
            "email@[123.123.123.123]",
            true,
          ],
          [
            "“email”@example.com",
            true,
          ],
          [
            "1234567890@example.com",
            true,
          ],
          [
            "email@example-one.com",
            true,
          ],
          [
            "_______@example.com",
            true,
          ],
          [
            "email@example.name",
            true,
          ],
          [
            "email@example.museum",
            true,
          ],
          [
            "email@example.co.jp",
            true,
          ],
          [
            "firstname-lastname@example.com",
            true,
          ],
        ]
      `);
    // array snapshot for invalid emails (should be false)
    // TODO: improve regex to not match all invalid emails
    expect(invalidEmails.map((email) => [email, emailRegex.test(email)]))
      .toMatchInlineSnapshot(`
        [
          [
            "plainaddress",
            false,
          ],
          [
            "#@%^%#$@#$@#.com",
            false,
          ],
          [
            "@example.com",
            false,
          ],
          [
            "Joe Smith <email@example.com>",
            false,
          ],
          [
            "email.example.com",
            false,
          ],
          [
            "email@example@example.com",
            false,
          ],
          [
            ".email@example.com",
            false,
          ],
          [
            "email.@example.com",
            false,
          ],
          [
            "email..email@example.com",
            false,
          ],
          [
            "あいうえお@example.com",
            false,
          ],
          [
            "email@example.com (Joe Smith)",
            false,
          ],
          [
            "email@example",
            false,
          ],
          [
            "email@-example.com",
            false,
          ],
          [
            "email@example.web",
            false,
          ],
          [
            "email@111.222.333.44444",
            false,
          ],
          [
            "email@example..com",
            false,
          ],
          [
            "Abc..123@example.com",
            false,
          ],
        ]
      `);
  });
});
