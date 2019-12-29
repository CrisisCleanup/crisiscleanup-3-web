import { MockWorksites, MockWorkTypes } from "@/utils/testing";

// const Worksite = jest.genMockFromModule("@/models/Worksite");

const ResolvedWorksite = {
  ...MockWorksites[0],
  work_types: [
    {
      ...MockWorkTypes[0],
      phone1: "123"
    },
    {
      ...MockWorkTypes[1],
      phone1: "123"
    }
  ]
};

export default {
  all: jest.fn(() => MockWorksites),
  getWorkType: jest.fn(() => MockWorkTypes[0]),
  query: () => ({
    where: () => ({
      get: () => MockWorksites[0]
    })
  }),
  api: () => ({
    get: () => MockWorksites[0]
  })
};
