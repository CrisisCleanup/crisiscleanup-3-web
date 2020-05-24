import getters from '../modules/ui/getters';

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
});
