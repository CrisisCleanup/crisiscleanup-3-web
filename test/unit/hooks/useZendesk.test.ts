import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
  vi,
  type MockedFunction,
} from 'vitest';
import { defineComponent, h } from 'vue';
import { mount } from '@vue/test-utils';
import {
  useProvideZendesk,
  useZendesk,
  ZendeskCommand,
  ZendeskTarget,
  type Zendesk,
  type ZendeskConfig,
} from '../../../src/hooks';

const initialConfig: ZendeskConfig = {
  webWidget: {
    color: {
      theme: '#123456',
      launcher: '#654321',
    },
    position: {
      horizontal: 'right',
      vertical: 'bottom',
    },
    offset: {
      horizontal: '20px',
    },
    contactForm: {
      suppress: false,
      fields: [
        {
          id: 'name',
          prefill: { '*': 'John Doe' },
        },
      ],
    },
  },
};

describe('useZendesk', () => {
  const zEMock = vi.fn() as MockedFunction<Zendesk>;

  beforeAll(() => {
    (window as typeof window & { zE: MockedFunction<Zendesk> }).zE = zEMock;
  });

  afterAll(() => {
    zEMock.mockReset();
    delete (window as typeof window & { zE: MockedFunction<Zendesk> }).zE;
  });

  const ChildComponent = defineComponent({
    setup() {
      const { config, zeWindow, zE } = useZendesk(initialConfig);
      expect(config).toEqual({
        ...initialConfig,
        webWidget: {
          ...initialConfig.webWidget,
          position: {
            ...initialConfig.webWidget.position,
            horizontal: 'left',
          },
        },
      });
      expect(zeWindow.value).toBeDefined();
      // something broken with tsconfig
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      zE(ZendeskTarget.WEB_WIDGET, ZendeskCommand.HIDE);
      return () => h('div');
    },
  });

  const RootComponent = defineComponent({
    setup() {
      // something broken with tsconfig
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const { config, zeWindow } = useProvideZendesk(initialConfig);
      expect(config).toEqual(initialConfig);
      expect(zeWindow.value).toBeDefined();
      config.webWidget.position.horizontal = 'left';
      return () => h(ChildComponent);
    },
  });

  test('useZendesk', () => {
    mount(RootComponent);
    expect(zEMock.mock.calls).toMatchInlineSnapshot(`
      [
        [
          "webWidget",
          "updateSettings",
          {
            "webWidget": {
              "color": {
                "launcher": "#654321",
                "theme": "#123456",
              },
              "contactForm": {
                "fields": [
                  {
                    "id": "name",
                    "prefill": {
                      "*": "John Doe",
                    },
                  },
                ],
                "suppress": false,
              },
              "offset": {
                "horizontal": "20px",
              },
              "position": {
                "horizontal": "left",
                "vertical": "bottom",
              },
            },
          },
        ],
        [
          "webWidget:on",
          "userEvent",
          [Function],
        ],
        [
          "webWidget",
          "hide",
        ],
        [
          "webWidget",
          "updateSettings",
          {
            "webWidget": {
              "color": {
                "launcher": "#654321",
                "theme": "#123456",
              },
              "contactForm": {
                "fields": [
                  {
                    "id": "name",
                    "prefill": {
                      "*": "John Doe",
                    },
                  },
                ],
                "suppress": false,
              },
              "offset": {
                "horizontal": "20px",
              },
              "position": {
                "horizontal": "left",
                "vertical": "bottom",
              },
            },
          },
        ],
      ]
    `);
  });

  test('useZendesk no-op when zendesk fails to load', () => {
    zEMock.mockReset();
    delete (window as typeof window & { zE: MockedFunction<Zendesk> }).zE;
    mount(
      defineComponent({
        setup() {
          useProvideZendesk(initialConfig);
          return () => h('div');
        },
      }),
    );
    expect(zEMock).not.toHaveBeenCalled();
  });
});
