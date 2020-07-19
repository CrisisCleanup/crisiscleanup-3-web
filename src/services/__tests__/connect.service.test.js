/**
 * Connect Service Tests
 */

import * as ACS from '../connect.service.js';

jest.mock('@crisiscleanup/amazon-connect-streams');

describe('connect service tests', () => {
  it('should bind events', () => {
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
