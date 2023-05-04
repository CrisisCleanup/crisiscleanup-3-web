import type User from '../User';

/**
 * Base fields for all CCU models
 */
export interface CCUBaseFields {
  id: number;
  invalidated_at?: Date;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface WorkType {
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
}

export interface CaseFlag {
  reason_t: undefined;
  notes: string;
  requested_action: string;
  is_high_priority: boolean;
}

export interface Status {
  status_name_t: string;
  status: string;
  primary_state?: string;
}

export interface Capability {
  capability: number;
  phase: number;
  id: number;
}

export interface FormField {
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
  phase: number;
}

export interface IncidentRequest {
  requested_by_contact: Partial<User>;
  id: number;
  incident: string;
}

export type IncidentPhase = {
  phase_key: string;
  phase_name_t: string;
  description_t: string;
  list_order: number;
  parent: number;
  is_active: boolean;
} & CCUBaseFields;

export type Portal = {
  name: string;
  portal_key: string;
  tos_updated_at: Date;
  default_currency: number;
  default_language: number;
} & CCUBaseFields;

export interface OrganizationRole {
  id: number;
  name_t: string;
}

export interface Message {
  id: number;
  created_by: number;
  timestamp: number;
  content: string;
  full_name: string;
  created_at: string;
  is_urgent: boolean;
  is_favorite: boolean;
  profile_picture_file: string;
}

export interface CCUFileItem {
  id: number;
  file: number;
  filename: string;
  url: string;
  full_url: string;
  blog_url: string;
  large_thumbnail_url: string;
  small_thumbnail_url: string;
  filename_original: string;
  file_type_t: string;
  mime_content_type: string | undefined;
  tag: string | undefined;
  title: string | undefined;
  notes: string | undefined;
  created_at: string;
}

export interface UserContact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

export type LocationJoin = {
  object_id: number;
  model: string;
  location: number; // Location ID
  tag: string | undefined;
  title: string | undefined;
  notes: string | undefined;
} & CCUBaseFields;
