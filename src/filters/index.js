import WorkType from "@/models/WorkType";

export function getWorkTypeName(work_type) {
    let work_types = WorkType.query().where('key', work_type).get();
    return work_types[0].name_t
}

export function getStatusBadge(status) {
    const status_dict = {
        "open_unassigned": "error",
        "open_assigned":"processing",
        "open_partially-completed":"processing",
        "open_needs-follow-up":"processing",
        "open_unresponsive":"default",
        "closed_completed":"success",
        "closed_partially-completed":"success",
        "closed_incomplete":"default",
        "closed_out-of-scope":"default",
        "closed_done-by-others":"success",
        "closed_no-help-wanted":"default",
        "closed_rejected":"default",
        "closed_duplicate":"default",
        "closed_marked-for-deletion":"default"
    };
    return status_dict[status];
}