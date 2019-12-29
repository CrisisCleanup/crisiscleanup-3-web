import { MockUsers } from "@/utils/testing";

export default {
  all: jest.fn(() => MockUsers),
  find: jest.fn(() => MockUsers[0]),
  database: jest.fn(() => MockUsers)
};
