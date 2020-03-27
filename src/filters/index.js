import { colors as iconColors, templates } from '@/icons/icons_templates';
import Status from '@/models/Status';
import WorkType from '@/models/WorkType';
import { RRule } from 'rrule';

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

export function getWorkTypeName(workType) {
  const workTypes = WorkType.query()
    .where('key', workType)
    .get();
  return workTypes[0].name_t;
}

export function getStatusName(statusKey) {
  const status = Status.query()
    .where('status', statusKey)
    .get();
  return status[0].status_name_t;
}

export function getRecurrenceString(rule) {
  return RRule.fromString(rule).toText();
}

export function getStatusBadge(status) {
  const statusDict = {
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
  return statusDict[status];
}

export const getColorForWorkType = workType => {
  if (!workType) {
    return '';
  }

  const colorsKey = `${workType.status}_${
    workType.claimed_by ? 'claimed' : 'unclaimed'
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

export const getWorkTypeImage = workType => {
  const colorsKey = `${workType.status}_${
    workType.claimed_by ? 'claimed' : 'unclaimed'
  }`;
  const worksiteTemplate = templates[workType.work_type] || templates.unknown;
  const svgColors = iconColors[colorsKey];

  if (svgColors) {
    return worksiteTemplate
      .replace('{{fillColor}}', svgColors.fillColor)
      .replace('{{strokeColor}}', svgColors.strokeColor)
      .replace('{{multple}}', '');
  }
  return '';
};

export const secondsToHm = seconds => {
  const d = Number(seconds);
  const h = Math.floor(d / 3600);
  const m = Math.floor((d % 3600) / 60);

  const hDisplay = `${h}h `;
  const mDisplay = `${m}m`;
  return hDisplay + mDisplay;
};
