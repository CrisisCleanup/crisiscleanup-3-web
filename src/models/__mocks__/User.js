import { MockUsers, mockModel } from '@/utils/testing';

export default mockModel(MockUsers, {
  api: {
    inviteUser: jest.fn(),
  },
});
