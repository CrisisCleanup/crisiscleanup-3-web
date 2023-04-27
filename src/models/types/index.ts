import type User from '../User';

/**
 * Base fields for all CCU models
 */
export type CCUBaseFields = {
  id: string;
  invalidated_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
};

export type WorkType = {
  id: number;
  key: string;
  name_t: string;
  description_t: string;
  status: string;
  claimed_by: number | undefined;
  work_type: string;
  case_number?: string;
  commercial_value: number;
  recur_default: string;
};

export type CaseFlag = {
  reason_t: undefined;
  notes: string;
  requested_action: string;
  is_high_priority: boolean;
};

export type Status = {
  status_name_t: string;
  status: string;
  primary_state?: string;
};

export type Capability = {
  capability: number;
  phase: number;
  id: number;
};

export type FormField = {
  html_type:
    | 'hidden'
    | 'divend'
    | 'h4'
    | 'h5'
    | 'select'
    | 'multiselect'
    | 'text'
    | 'cronselect'
    | 'suggest'
    | 'textarea'
    | 'checkbox';
  field_key: string;
  field_parent_key: string;
  order_label: string;
  list_order: number;
  help_t: string;
  label_t: string;
  placeholder_t: string;
  values: string[];
  values_default_t: Record<string, string>;
  children: FormField[];
  if_selected_then_work_type: string;
  read_only_break_glass: boolean;
  recur_default: string;
};

export type IncidentRequest = {
  requested_by_contact: Partial<User>;
  id: number;
  incident: string;
};

export type IncidentPhase = {
  phase_key: string;
  phase_name_t: string;
  description_t: string;
  list_order: number;
  parent: number;
  is_active: boolean;
} & CCUBaseFields;

export type OrganizationRole = {
  id: number;
  name_t: string;
};

export type Message = {
  id: number;
  created_by: number;
  timestamp: number;
  content: string;
  full_name: string;
  created_at: string;
  is_urgent: boolean;
  is_favorite: boolean;
  profile_picture_file: string;
};
