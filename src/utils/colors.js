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
