import { MockWorksiteRequest } from '@/utils/testing';

export default {
  all: () => [MockWorksiteRequest],
  deleteAll: () => {},
  query: () => ({
    where: () => ({
      get: () => MockWorksiteRequest,
    }),
    whereIdIn: () => ({
      get: () => MockWorksiteRequest,
    }),
    orderBy: () => ({
      get: () => MockWorksiteRequest,
    }),
  }),
};
