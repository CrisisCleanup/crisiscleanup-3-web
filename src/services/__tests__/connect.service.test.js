/**
 * Connect Service Tests
 */

import * as ACS from '../connect.service.js';

describe('connect service tests', () => {
  it.skip('should bind events', () => {
    const cbMock = jest.fn();
    ACS.bindEvents(ACS.EventTopics.AGENT, {
      [ACS.AgentEvents.ON_ROUTABLE]: cbMock,
    });
    expect(cbMock.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          true,
        ],
      ]
    `);
  });
});
