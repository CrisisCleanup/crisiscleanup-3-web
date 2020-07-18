/**
 * websocket.js
 * WebSocket Store Tests
 */

import { getModule } from 'vuex-module-decorators';
import WebsocketStore, { ACTIONS } from '@/store/modules/websocket';
import Vuex from 'vuex';
import Vue from 'vue';

Vue.use(Vuex);

const mockStore = new Vuex.Store({
  modules: {
    websocket: WebsocketStore,
  },
});

describe('websocket store', () => {
  beforeEach(() => {
    window.vue.$socket.sendObj.mockClear();
  });

  it('sets connection status', async () => {
    const store = getModule(WebsocketStore, mockStore);
    expect(store.isConnected).toBe(false);
    await store.setConnected(true);
    expect(store.isConnected).toBe(true);
    await store.setConnected(false);
    expect(store.isConnected).toBe(false);
  });

  it('should generate a valid payload on send action', () => {
    const store = getModule(WebsocketStore, mockStore);
    store
      .send({ action: ACTIONS.CLIENT_HEARTBEAT, data: { fake: 'data' } })
      .then(() => {
        expect(window.vue.$socket.sendObj.mock.calls).toMatchInlineSnapshot(`
          Array [
            Array [
              Object {
                "action": "CLIENT_HEARTBEAT",
                "data": Object {
                  "fake": "data",
                },
                "options": Object {
                  "includeMeta": true,
                },
              },
            ],
          ]
        `);
        expect(store.lastSent).toMatchInlineSnapshot(`
          Object {
            "action": "CLIENT_HEARTBEAT",
            "data": Object {
              "fake": "data",
            },
            "options": Object {
              "includeMeta": true,
            },
          }
        `);
      });
  });

  it('should generate valid payload on send action with options', async () => {
    const store = getModule(WebsocketStore, mockStore);
    await store.send({
      action: ACTIONS.CLIENT_HEARTBEAT,
      data: { some: 'data' },
      options: { includeMeta: false },
    });
    expect(window.vue.$socket.sendObj.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          Object {
            "action": "CLIENT_HEARTBEAT",
            "data": Object {
              "some": "data",
            },
            "options": Object {
              "includeMeta": false,
            },
          },
        ],
      ]
    `);
    expect(store.lastSent).toMatchInlineSnapshot(`
      Object {
        "action": "CLIENT_HEARTBEAT",
        "data": Object {
          "some": "data",
        },
        "options": Object {
          "includeMeta": false,
        },
      }
    `);
  });
});
