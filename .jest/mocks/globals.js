require('@crisiscleanup/amazon-connect-streams');

global.connect.RTCSession = function () {};
global.connect.core.agent = jest.fn();
global.connect.agent = jest.fn();
global.connect.hitch = jest.fn();
global.connect.onAuthFail = jest.fn();

global.vue = {
  $i18n: {
    t: (key) => key,
  },
  $socket: {
    sendObj: jest.fn(),
  },
};
