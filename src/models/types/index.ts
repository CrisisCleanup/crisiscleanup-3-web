import User from "../User";

export type WorkType = {
  key: string;
  name_t: string;
  status: string;
  claimed_by: number | undefined;
  work_type: string;
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
  html_type: "hidden" | "divend" | "h4" | "h5" | "select" | "multiselect" | "text" | "cronselect" | "suggest" | "textarea" | "checkbox";
  field_key: string;
  field_parent_key: string;
  order_label: string;
  list_order: number;
  help_t: string;
  label_t: string;
  placeholder_t: string;
  values: string[];
  values_default_t: Record<string, string>[];
  children: FormField[]
};

export type IncidentRequest = {
  requested_by_contact: Partial<User>;
  id: number;
};

export type OrganizationRole = {
  id: number;
  name_t: string;
};