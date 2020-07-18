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
};

global.vue = {
  $i18n: {
    t: (key) => key,
  },
  $socket: {
    sendObj: jest.fn(),
  },
};
