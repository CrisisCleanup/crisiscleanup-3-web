let _seed = Date.now();
export function rand(min, max) {
  const seed = _seed;
  const minVal = min === undefined ? 0 : min;
  const maxVal = max === undefined ? 1 : max;
  _seed = (seed * 9301 + 49297) % 233280;
  return minVal + (_seed / 233280) * (maxVal - minVal);
}
