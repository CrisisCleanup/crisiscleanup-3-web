import { AsYouType, ParseError, parsePhoneNumber } from 'libphonenumber-js';

export default function useValidation() {
  function validatePhoneNumber(value = '') {
    let newValue = value;
    try {
      newValue = new AsYouType('US').input(value);
    } catch {
      return { newValue: value, valid: false };
    }
    try {
      parsePhoneNumber(newValue, 'US');
    } catch (e) {
      if (e instanceof ParseError) {
        return { newValue, valid: false };
      }
    }
    return { newValue, valid: true };
  }

  return {
    validatePhoneNumber,
  };
}
