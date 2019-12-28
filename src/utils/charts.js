let _seed = Date.now();
export function rand(min, max) {
  const seed = _seed;
  min = min === undefined ? 0 : min;
  max = max === undefined ? 1 : max;
  _seed = (seed * 9301 + 49297) % 233280;
  return min + (_seed / 233280) * (max - min);
}
