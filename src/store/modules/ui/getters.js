/*
 * UI Store Getters.
 *
 */

const isBrowserIE = ({ browser: { userAgent } }) =>
  userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1;

export default {
  isBrowserIE,
};
