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
