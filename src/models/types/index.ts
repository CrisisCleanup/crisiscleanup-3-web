export interface WorkType {
  key: string;
  name_t: string;
  status: string;
  claimed_by: number | null;
  work_type: string;
}

export interface Status {
  status_name_t: string;
  status: string;
}

export interface Capability {
  capability: number;
  phase: number;
  id: number;
}
