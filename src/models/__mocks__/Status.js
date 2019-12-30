export const MockStatus = [
  {
    id: 1,
    status_name_t: 'status.open_unassigned',
    substatus_name_t: 'substatus.unassigned',
    description_t: 'statusDescription.open_unassigned',
    status: 'open_unassigned',
    primary_state: 'open',
    substatus: 'unassigned',
    claimed_class: 'open-unassigned-claimed',
    unclaimed_class: 'open-unassigned-unclaimed',
    completed_by_anybody: '0.00',
    completed_by_ccu: '0.00',
    completed_db: '0.00',
  },
  {
    id: 2,
    status_name_t: 'status.open_assigned',
    substatus_name_t: 'substatus.assigned',
    description_t: 'statusDescription.open_assigned',
    status: 'open_assigned',
    primary_state: 'open',
    substatus: 'assigned',
    claimed_class: 'open-assigned-claimed',
    unclaimed_class: 'open-assigned-unclaimed',
    completed_by_anybody: '0.25',
    completed_by_ccu: '0.25',
    completed_db: '0.25',
  },
];

export default {
  all: jest.fn(() => MockStatus),
  query: () => ({
    where: () => ({
      get: () => MockStatus,
    }),
  }),
};
