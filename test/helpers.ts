import { faker } from '@faker-js/faker';

export const MOCK_DATE = new Date(Date.UTC(2022, 1, 1, 1, 1, 1, 1));

export function generateMockIncident() {
  const _id = faker.datatype.number();
  const disasterName = faker.random.alphaNumeric(3);
  return {
    $id: _id,
    id: _id,
    case_label: faker.random.alpha(),
    timezone: faker.address.timeZone(),
    form_fields: generateMockIncidentFormFields(),
    geofence: null,
    short_name: disasterName,
    name: `Hurricane ${disasterName}`,
    start_at: faker.date.past().toISOString(),
    uuid: faker.datatype.uuid(),
    extent: null,
    incident_type: generateMockIncidentType(),
    color: faker.internet.color(),
    locations: generateMockIncidentLocations(),
    turn_on_release: faker.datatype.boolean(),
    auto_contact: faker.datatype.boolean(),
    active_phone_number: null,
    created_work_types: [],
    is_archived: faker.datatype.boolean(),
  };
}

export function generateMockIncidentType() {
  return faker.helpers.arrayElement([
    'hurricane',
    'wildfire',
    'fire',
    'earthquake',
    'flood',
    'tornado',
    'volcano',
    'tsunami',
    'drought',
    'avalanche',
  ]);
}

export function generateMockIncidentFormFields(
  formFieldKeys: string[] = [
    'property_info',
    'children_in_home',
    'first_responder',
    'veteran',
    'primary_language',
    'rebuild_details',
    'debris_status',
    'prepared_by',
    'do_not_work_before',
    'claim_status_report_info_end',
  ],
) {
  return formFieldKeys.map((key) => ({
    label_t: faker.random.word(),
    html_type: faker.helpers.arrayElement([
      'text',
      'checkbox',
      'select',
      'textarea',
    ]),
    data_sensitivity: faker.helpers.arrayElement([
      'verySensitive',
      'orgSensitive',
      'sensitive',
      'public',
    ]),
    data_group: faker.helpers.arrayElement([
      'personalInfo',
      'workInfo',
      'caseInfo',
    ]),
    help_t: faker.datatype.boolean() ? faker.lorem.sentence() : null,
    placeholder_t: faker.datatype.boolean() ? faker.lorem.word() : null,
    is_required_default: faker.datatype.boolean(),
    is_read_only_default: faker.datatype.boolean(),
    read_only_break_glass: faker.datatype.boolean(),
    values_default_t: null,
    order_label: faker.datatype.number(),
    validation: 'string',
    values: null,
    is_required: faker.datatype.boolean(),
    is_read_only: faker.datatype.boolean(),
    list_order: faker.datatype.number(),
    invalidated_at: null,
    field_key: key,
    field_parent_key: null,
    if_selected_then_work_type: null,
    phase: 4,
  }));
}

export function generateMockIncidentLocations() {
  return [
    {
      tag: null,
      title: null,
      notes: null,
      created_at: faker.date.past().toISOString(),
      id: faker.datatype.number(),
      location: faker.datatype.number(),
      object_id: faker.datatype.number(),
    },
  ];
}
