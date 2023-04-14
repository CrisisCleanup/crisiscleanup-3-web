import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { config } from '@vue/test-utils';

config.global.mocks = {
  $t: (string: string, context: Record<string, any>) => string, // just return translation key
};

vi.mock('@geoman-io/leaflet-geoman-free', () => {
  return {
    __esModule: true,
    default: vi.fn(),
  };
});
vi.mock('vue-json-viewer', () => {
  return {
    __esModule: true,
    default: vi.fn(),
  };
});
vi.mock('vue3-mq');

class MockWorker {
  private url: string;
  private onmessage: (p: { data: any }) => void;
  constructor(stringUrl: string) {
    this.url = stringUrl;
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    this.onmessage = () => undefined;
  }

  postMessage(msg: any) {
    this.onmessage({ data: msg });
  }

  addEventListener(type: any, listener: (p: { data: any }) => void) {
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    this.onmessage = listener;
  }

  removeEventListener() {
    // eslint-disable-next-line unicorn/prefer-add-event-listener
    this.onmessage = () => undefined;
  }

  terminate() {
    return undefined;
  }
}

global.Worker = MockWorker as any;

const tableData = [
  {
    id: 'id_from_table_data',
    name: 'Name from table data',
  },
];

export const restHandlers = [
  rest.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/table`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          results: tableData,
        }),
      );
    },
  ),
  rest.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/chat_messages`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          results: [
            {
              id: 1,
              content: 'Hello, how can I help you?',
              created_at: '2023-01-01T00:00:00.000Z',
              is_urgent: false,
            },
            {
              id: 2,
              content: 'I need assistance with my account.',
              created_at: '2023-01-01T01:00:00.000Z',
              is_urgent: false,
            },
          ],
        }),
      );
    },
  ),
  rest.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/chat_groups/1/my_favorites`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          results: [],
        }),
      );
    },
  ),
  rest.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/users/undefined`,
    (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({}));
    },
  ),
  rest.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_import`,
    (req, res, ctx) => {
      return res(
        ctx.status(200),
        ctx.json({
          results: [
            /* Add mock data for the API response */
          ],
        }),
      );
    },
  ),

  rest.post(
    `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_import`,
    (req, res, ctx) => {
      return res(ctx.status(200));
    },
  ),

  rest.get(
    `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/worksites_import/:reportId/get_successes`,
    (req, res, ctx: any) => {
      return res(
        ctx.status(200),
        ctx.blob(
          new Blob([
            /* Add mock data for the API response */
          ]),
        ),
      );
    },
  ),

  rest.get(
    `${
      import.meta.env.VITE_APP_API_BASE_URL
    }/worksites_import/:reportId/get_failures`,
    (req, res, ctx: any) => {
      return res(
        ctx.status(200),
        ctx.blob(
          new Blob([
            /* Add mock data for the API response */
          ]),
        ),
      );
    },
  ),
];

const server = setupServer(...restHandlers);

// Start server before all tests
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));

//  Close server after all tests
afterAll(() => server.close());

// Reset handlers after each test `important for test isolation`
afterEach(() => server.resetHandlers());
