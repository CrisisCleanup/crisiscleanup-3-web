/**
 *
 * Testing Helpers
 *
 * utils
 */

export const MockOrganizations = [
  {
    id: 1,
    name: 'Test Organization',
    url: null,
    is_active: null,
    org_verified: null,
    created_at: '2019-12-25T18:24:05Z',
    updated_at: '2019-12-25T18:24:05Z',
  },
];

export const MockUsers = [
  {
    id: 1,
    first_name: 'First',
    last_name: 'Last',
    organization: {
      id: 1,
      name: 'Test Organization',
    },
  },
  {
    id: 2,
    first_name: 'Test',
    last_name: 'Last',
    organization: {
      id: 1,
      name: 'Test Organization',
    },
  },
];

export const MockWorkTypes = [
  {
    id: 1,
    name_t: 'workType.ash',
    description_t: 'workTypeDescription.ash',
    key: 'ash',
    file_prefix: 'Ash',
    commercial_value: 15000,
    depreciated_at: null,
    phase: null,
  },
  {
    id: 2,
    name_t: 'workType.biohazard',
    description_t: 'workTypeDescription.biohazard',
    key: 'biohazard',
    file_prefix: 'Biohazard',
    commercial_value: 50000,
    depreciated_at: null,
    phase: null,
  },
  {
    id: 7,
    name_t: 'workType.deferred_maintenance',
    description_t: 'workTypeDescription.deferred_maintenance',
    key: 'deferred_maintenance',
    file_prefix: 'Deferred_Maintenance',
    commercial_value: 10000,
    depreciated_at: null,
    phase: null,
  },
  {
    id: 16,
    name_t: 'workType.flood_indoor',
    description_t: 'workTypeDescription.flood_indoor',
    key: 'flood_indoor',
    file_prefix: 'Flood_indoor',
    commercial_value: 18000,
    depreciated_at: null,
    phase: null,
  },
  {
    id: 29,
    name_t: 'workType.pda_1',
    description_t: 'workTypeDescription.pda_1',
    key: 'pda_1',
    file_prefix: 'pda_1',
    commercial_value: 0,
    depreciated_at: null,
    phase: null,
  },
];

export const MockWorksites = [
  {
    id: 1,
    case_number: 'A196',
    name: 'First Last',
    updated_at: '2019-12-25T18:25:21.467128Z',
    location: {
      type: 'Point',
      coordinates: [-82.0535959749408, 29.8670584991275],
    },
    work_types: [
      {
        work_type: 'flood_indoor',
        status: 'closed_incomplete',
        claimed_by: null,
      },
      {
        work_type: 'pda_1',
        status: 'closed_incomplete',
        claimed_by: null,
      },
    ],
  },
  {
    id: 2,
    case_number: 'A68',
    name: 'Test Last',
    updated_at: '2019-12-25T18:25:21.494727Z',
    location: {
      type: 'Point',
      coordinates: [-82.3116865679154, 29.9818650922746],
    },
    work_types: [
      {
        work_type: 'pda_5',
        status: 'open_partially-completed',
        claimed_by: null,
      },

      {
        work_type: 'deferred_maintenance',
        status: 'closed_no-help-wanted',
        claimed_by: null,
      },
      {
        work_type: 'pda_1',
        status: 'closed_completed',
        claimed_by: null,
      },
    ],
  },
];

export const MockWorksiteRequest = {};

export const MockIncident = {
  id: 99,
  name: 'Texas Flooding, Oct 2018',
  case_label: 'A',
  start_at: '2018-10-17T00:00:00Z',
  form_fields: [
    {
      label_t: 'formLabels.phone1',
      html_type: 'text',
      data_sensitivity: 'verySensitive',
      data_group: 'personalInfo',
      help_t: 'formLabels.phone1_help',
      placeholder_t: 'formLabels.phone1_placeholder',
      is_required_default: true,
      is_read_only_default: false,
      read_only_break_glass: false,
      values_default: null,
      validation: 'string',
      values: null,
      is_required: null,
      is_read_only: null,
      list_order: 11,
      replaced_at: null,
      field_key: 'phone1',
      field_parent_key: 'property_info',
      if_selected_then_work_type: null,
      phase: 4,
    },
  ],
};

export const MockPhoneStatus = [
  {
    id: 1,
    substatus_name_t: 'Added work request to Crisis Cleanup',
    status_name_t: 'Answered: Added work request to Crisis Cleanup',
    primary_state_name_t: 'Answered',
    primary_state: 'answered',
    status: 'answered_added',
    substatus: 'added',
    completion: 1.0,
    try_again_delay: 0,
    list_order: 50,
    created_at: '2018-10-29T04:57:13Z',
    updated_at: '2020-03-25T04:19:27Z',
    must_associate_worksite: 'never',
    created_by: 14,
    updated_by: 14,
  },
];

export const MockAgents = [
  {
    agent_id: 'xxxx',
    instance_id: 'instance',
    arn: 'agentarn',
    user: MockUsers[0],
  },
];

export const mockModel = (data, { api, statics } = {}) => ({
  create: jest.fn(() => data[0]),
  all: jest.fn(() => data),
  find: jest.fn(() => data[0]),
  database: jest.fn(() => data),
  query: () => ({
    where: () => ({
      get: () => data[0],
    }),
    ...statics,
  }),
  api: jest.fn(() => ({
    get: () => data[0],
    fetch: () => data[0],
    ...api,
  })),
});
