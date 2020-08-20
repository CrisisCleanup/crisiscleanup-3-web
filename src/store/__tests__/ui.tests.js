import getters from '../modules/ui/getters';
import actions from '../modules/ui/actions.js';

describe('ui store', () => {
  it('Detects Internet Explorer with IE User Agent', () => {
    const ieUserAgent =
      'Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1; .NET CLR 1.1.4322)';
    const state = {
      browser: {
        userAgent: ieUserAgent,
      },
    };
    expect(getters.isBrowserIE(state)).toBeTruthy();
  });

  it('Does not detect Internet Explorer with Chrome User Agent', () => {
    const chromeUserAgent =
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36';
    const state = {
      browser: {
        userAgent: chromeUserAgent,
      },
    };
    expect(getters.isBrowserIE(state)).toBeFalsy();
  });

  it('validateBrowser shows banner in IE', async () => {
    const commit = jest.fn();
    const state = {};
    await actions.validateBrowser({
      commit,
      state,
      getters: {
        isBrowserIE: jest.fn(() => true),
      },
    });
    expect(commit.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "SET_BANNER",
          Object {
            "enabled": true,
            "text": "info.ie_not_supported",
            "type": "ERROR",
          },
        ],
      ]
    `);
  });

  it('validateBrowser does not show banner outside IE', async () => {
    const commit = jest.fn();
    const state = {};
    await actions.validateBrowser({
      commit,
      state,
      getters: { isBrowserIE: false },
    });
    expect(commit.mock.calls.length).toBe(0);
  });

  it('dismissBrowser closes banner', async () => {
    const commit = jest.fn();
    const state = { siteBanner: { enabled: true } };
    await actions.dismissBanner({ commit, state });
    expect(commit.mock.calls).toMatchInlineSnapshot(`
      Array [
        Array [
          "SET_BANNER",
          Object {
            "enabled": false,
          },
        ],
      ]
    `);
  });
});
