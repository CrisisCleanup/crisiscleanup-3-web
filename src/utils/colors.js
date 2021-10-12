export const getNearestColor = (value, overrideColors) => {
  const colors = overrideColors || require('tailwindcss/defaultTheme').colors;
  const flattenObject = (obj, sep = '-') =>
    Object.assign(
      {},
      ...(function _flatten(o, p = '') {
        return [].concat(
          ...Object.keys(o)
            .filter((k) => k.toLowerCase() !== 'transparent')
            .filter((k) => k.toLowerCase() !== 'current')
            .map((k) =>
              typeof o[k] === 'object'
                ? _flatten(o[k], k + sep)
                : {
                    [(p + k).replace(`${sep}default`, '')]: o[k]
                      .replace(' ', '')
                      .toLowerCase(),
                  },
            ),
        );
      })(obj),
    );
  const findNearestColor = require('nearest-color').from(flattenObject(colors));
  return findNearestColor(value);
};

export const stringToColor = (stringInput) => {
  const h = [...stringInput].reduce((acc, char) => {
    // eslint-disable-next-line no-bitwise
    return char.charCodeAt(0) + ((acc << 2) - acc);
  }, 0);
  const s = 95;
  const l = 35 / 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0'); // convert to Hex and prefix "0" if needed
  };
  return `#${f(0)}${f(8)}${f(4)}`;
};
