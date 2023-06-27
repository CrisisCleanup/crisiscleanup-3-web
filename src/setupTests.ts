import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { config } from '@vue/test-utils';
import { createI18n } from 'vue-i18n';
import { Vue3Mq } from 'vue3-mq';

const i18n = createI18n({
  legacy: false,
  locale: 'en',
  messages: {
    en: {},
  },
});

config.global.mocks = {
  $t: (string: string, context: Record<string, any>) => string, // just return translation key
};

config.global.plugins = [i18n, Vue3Mq];

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
vi.mock('vue3-mq', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('vue3-mq');
  return {
    ...actual,
  };
});

class MockWorker {
  private readonly url: string;
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
    async (req, res, ctx) => {
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
    async (req, res, ctx) => {
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
    async (req, res, ctx) => {
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
    async (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({}));
    },
  ),
  rest.get(
    `${import.meta.env.VITE_APP_API_BASE_URL}/worksites_import`,
    async (req, res, ctx) => {
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
    async (req, res, ctx) => {
      return res(ctx.status(200));
    },
  ),

  rest.get(
    `${import.meta.env.VITE_APP_API_BASE_URL
    }/worksites_import/:reportId/get_successes`,
    async (req, res, ctx: any) => {
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
    `${import.meta.env.VITE_APP_API_BASE_URL
    }/worksites_import/:reportId/get_failures`,
    async (req, res, ctx: any) => {
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
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

//  Close server after all tests
afterAll(() => {
  server.close();
});

// Reset handlers after each test `important for test isolation`
afterEach(() => {
  server.resetHandlers();
});
