export const MockRole = [
  {
    id: 1,
    name_t: 'System Administrator',
    description_t: 'System administrator of the entire system, and all portals',
    level: 0,
    is_default: false,
  },
  {
    id: 3,
    name_t: 'Primary Contact',
    description_t:
      'Face of the organization to other relief agencies using Crisis Cleanup. A Primary Contact may also affiliate his or her organization with other organizations. An organization can (and should) have more than one Primary Contact.',
    level: 3,
    is_default: false,
  },
];

export default {
  all: jest.fn(() => MockRole),
  query: () => ({
    where: () => ({
      get: () => MockRole,
    }),
    orderBy: () => ({
      get: () => MockRole,
    }),
  }),
};
