import { MockPhoneStatus } from '@/utils/testing';

export default {
  all: jest.fn(() => MockPhoneStatus),
  find: jest.fn(() => MockPhoneStatus[0]),
  database: jest.fn(() => MockPhoneStatus),
};
