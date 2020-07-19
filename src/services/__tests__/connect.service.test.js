/**
 * Connect Service Tests
 */

import * as ACS from '../connect.service.js';

describe('connect service tests', () => {
  it('should bind agent events', () => {
    const cbMock = jest.fn();
    ACS.bindEvents(ACS.EventTopics.AGENT, {
      [ACS.AgentEvents.ON_ROUTABLE]: cbMock,
      [ACS.ContactEvents.ON_PENDING]: cbMock,
    });
    expect(global.connect.agent.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          [Function],
        ],
        Array [
          [Function],
        ],
      ]
    `);
  });
});
