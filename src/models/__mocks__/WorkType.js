import { MockWorkTypes } from '@/utils/testing';

export default {
  all: () => MockWorkTypes,
  map: () => MockWorkTypes,
  query: () => ({
    where: () => ({
      get: () => MockWorkTypes[0],
    }),
    whereIdIn: () => ({
      get: () => MockWorkTypes[0],
    }),
    orderBy: () => ({
      get: () => MockWorkTypes[0],
    }),
  }),
  api: () => ({
    get: () => MockWorkTypes[0],
  }),
};
