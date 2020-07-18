global.connect = {
  AgentStateType: {
    OFFLINE: 'offline',
    ROUTABLE: 'routable',
  },
  ContactStateType: {
    INCOMING: 'incoming',
    CONNECTING: 'connecting',
    CONNECTED: 'connected',
    PENDING: 'pending',
    ENDED: 'ended',
  },
  hitch: jest.fn((handler, callback) => callback(true)),
  agent: jest.fn((mock) => ({
    onRoutable: mock({
      onRoutable: jest.fn((val) => 'onRoutable event'),
    }),
  })),
};

global.vue = {
  $i18n: {
    t: (key) => key,
  },
  $socket: {
    sendObj: jest.fn(),
  },
};
