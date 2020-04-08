import { AsYouType, ParseError, parsePhoneNumber } from 'libphonenumber-js';

export default {
  methods: {
    validatePhoneNumber(value) {
      const newValue = new AsYouType('US').input(value);
      try {
        parsePhoneNumber(newValue, 'US');
      } catch (e) {
        if (e instanceof ParseError) {
          return { newValue, valid: false };
        }
      }
      return { newValue, valid: true };
    },
  },
};
