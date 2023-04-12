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
