/**
 * Mixin Utility
 */

/**
 * Mixin factory utility.
 * @see http://raganwald.com/2015/06/26/decorators-in-es7.html
 * @param behaviour
 * @param sharedBehaviour
 * @returns {function(*): *}
 */
const mixin = (behaviour, sharedBehaviour = {}) => {
  const instanceKeys = Reflect.ownKeys(behaviour);
  const sharedKeys = Reflect.ownKeys(sharedBehaviour);
  const typeTag = Symbol('isa');

  function _mixin(clazz) {
    // eslint-disable-next-line no-restricted-syntax
    for (const property of instanceKeys)
      Object.defineProperty(clazz.prototype, property, {
        value: behaviour[property],
        writable: true,
      });
    Object.defineProperty(clazz.prototype, typeTag, { value: true });
    return clazz;
  }
  // eslint-disable-next-line no-restricted-syntax
  for (const property of sharedKeys)
    Object.defineProperty(_mixin, property, {
      value: sharedBehaviour[property],
      // eslint-disable-next-line no-prototype-builtins
      enumerable: sharedBehaviour.propertyIsEnumerable(property),
    });
  Object.defineProperty(_mixin, Symbol.hasInstance, {
    value: (i) => !!i[typeTag],
  });
  return _mixin;
};

export default mixin;
