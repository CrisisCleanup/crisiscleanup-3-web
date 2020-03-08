import { MockOrganizations } from '@/utils/testing';

export default {
  all: () => MockOrganizations,
  map: () => MockOrganizations,
  query: () => ({
    where: () => ({
      get: () => MockOrganizations[0],
    }),
    whereIdIn: () => ({
      get: () => MockOrganizations[0],
    }),
    orderBy: () => ({
      get: () => MockOrganizations[0],
    }),
  }),
  api: () => ({
    get: () => MockOrganizations[0],
  }),
};
