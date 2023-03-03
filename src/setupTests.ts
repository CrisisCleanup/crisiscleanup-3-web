import { afterAll, afterEach, beforeAll } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { config } from '@vue/test-utils';

config.global.mocks = {
  $t: (string: string, context: Record<string, any>) => string, // just return translation key
};

const tableData = [
  {
    id: 'id_from_table_data',
    name: 'Name from table data',
  },
];

export const restHandlers = [
  rest.get('https://test.crisiscleanup.io/table', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        results: tableData,
      }),
    );
  }),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
