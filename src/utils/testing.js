/**
 *
 * Testing Helpers
 *
 * utils
 */

export const MockWorkTypes = [
  {
    id: 1,
    name_t: "workType.ash",
    description_t: "workTypeDescription.ash",
    key: "ash",
    file_prefix: "Ash",
    commercial_value: 15000,
    depreciated_at: null,
    phase: null
  },
  {
    id: 2,
    name_t: "workType.biohazard",
    description_t: "workTypeDescription.biohazard",
    key: "biohazard",
    file_prefix: "Biohazard",
    commercial_value: 50000,
    depreciated_at: null,
    phase: null
  },
  {
    id: 7,
    name_t: "workType.deferred_maintenance",
    description_t: "workTypeDescription.deferred_maintenance",
    key: "deferred_maintenance",
    file_prefix: "Deferred_Maintenance",
    commercial_value: 10000,
    depreciated_at: null,
    phase: null
  },
  {
    id: 16,
    name_t: "workType.flood_indoor",
    description_t: "workTypeDescription.flood_indoor",
    key: "flood_indoor",
    file_prefix: "Flood_indoor",
    commercial_value: 18000,
    depreciated_at: null,
    phase: null
  },
  {
    id: 29,
    name_t: "workType.pda_1",
    description_t: "workTypeDescription.pda_1",
    key: "pda_1",
    file_prefix: "pda_1",
    commercial_value: 0,
    depreciated_at: null,
    phase: null
  }
];

export const MockWorksites = [
  {
    id: 1,
    case_number: "A196",
    name: "First Last",
    updated_at: "2019-12-25T18:25:21.467128Z",
    location: {
      type: "Point",
      coordinates: [-82.0535959749408, 29.8670584991275]
    },
    work_types: [
      {
        work_type: "flood_indoor",
        status: "closed_incomplete",
        claimed_by: null
      },
      {
        work_type: "pda_1",
        status: "closed_incomplete",
        claimed_by: null
      }
    ]
  },
  {
    id: 2,
    case_number: "A68",
    name: "Test Last",
    updated_at: "2019-12-25T18:25:21.494727Z",
    location: {
      type: "Point",
      coordinates: [-82.3116865679154, 29.9818650922746]
    },
    work_types: [
      {
        work_type: "pda_5",
        status: "open_partially-completed",
        claimed_by: null
      },

      {
        work_type: "deferred_maintenance",
        status: "closed_no-help-wanted",
        claimed_by: null
      },
      {
        work_type: "pda_1",
        status: "closed_completed",
        claimed_by: null
      }
    ]
  }
];
