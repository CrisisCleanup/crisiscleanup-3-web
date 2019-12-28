import WorkType from '@/models/WorkType';
import Status from '@/models/Status';
import { colors } from '@/utils/colors';
import { colors as iconColors } from '@/icons/icons_templates';

export function snakeToTitleCase(value) {
  if (!value) return '';
  // ref: https://gist.github.com/kkiernan/91298079d34f0f832054
  return value
    .split('_')
    .map(function(item) {
      return item.charAt(0).toUpperCase() + item.substring(1);
    })
    .join(' ');
}

export function getWorkTypeName(work_type) {
  const work_types = WorkType.query()
    .where('key', work_type)
    .get();
  return work_types[0].name_t;
}

export function getStatusName(statusKey) {
  const status = Status.query()
    .where('status', statusKey)
    .get();
  return status[0].status_name_t;
}

export function getStatusBadge(status) {
  const status_dict = {
    open_unassigned: 'error',
    open_assigned: 'processing',
    'open_partially-completed': 'processing',
    'open_needs-follow-up': 'processing',
    open_unresponsive: 'default',
    closed_completed: 'success',
    'closed_partially-completed': 'success',
    closed_incomplete: 'default',
    'closed_out-of-scope': 'default',
    'closed_done-by-others': 'success',
    'closed_no-help-wanted': 'default',
    closed_rejected: 'default',
    closed_duplicate: 'default',
    'closed_marked-for-deletion': 'default',
  };
  return status_dict[status];
}

export const getColorForWorkType = work_type => {
  if (!work_type) {
    return '';
  }

  const colorsKey = `${work_type.status}_${
    work_type.claimed_by ? 'claimed' : 'unclaimed'
  }`;
  const colors = iconColors[colorsKey];
  return colors.fillColor;
};

export const getColorForStatus = (status, claimed = true) => {
  let colorsKey = `${status}_${claimed ? 'claimed' : 'unclaimed'}`;
  let colors = iconColors[colorsKey];

  if (!colors) {
    colorsKey = `open_unassigned_${claimed ? 'claimed' : 'unclaimed'}`;
    colors = iconColors[colorsKey];
  }

  return colors.fillColor;
};
