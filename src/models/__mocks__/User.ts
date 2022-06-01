import { MockUsers, mockModel } from '@/utils/testing';

// @ts-ignore
export default mockModel(MockUsers, {
  api: {
    inviteUser: jest.fn(),
  },
});
