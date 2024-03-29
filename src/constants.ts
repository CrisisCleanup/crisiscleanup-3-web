/**
 * Various Constants
 */
import { snakeCase } from 'lodash';
export const TEXT_VARIANTS = [
  'h1',
  'h2',
  'h3',
  'h4',
  'body',
  'bodysm',
  'bodyxsm',
];
export const ICON_MAP = {
  'attention-red': require('@/assets/icons/attention-red.svg'),
  about: require('@/assets/icons/about-us.svg'),
  'arrow-left': require('@/assets/icons/arrow-left.svg'),
  'arrow-right': require('@/assets/icons/arrow-right.svg'),
  attention: require('@/assets/icons/attention.svg'),
  dashboard: require('@/assets/icons/dashboard.svg'),
  home: require('@/assets/icons/home.svg'),
  cases: require('@/assets/icons/cases.svg'),
  'current-disasters': require('@/assets/icons/current-disaster.svg'),
  contact: require('@/assets/icons/contact-us.svg'),
  completed: require('@/assets/icons/completed.svg'),
  training: require('@/assets/icons/training.svg'),
  notepad: require('@/assets/icons/notepad.svg'),
  terms: require('@/assets/icons/terms.svg'),
  privacy: require('@/assets/icons/privacy-policy.svg'),
  reports: require('@/assets/icons/reports.svg'),
  calendar: require('@/assets/icons/calendar.svg'),
  call: require('@/assets/icons/call.svg'),
  chat: require('@/assets/icons/chat.svg'),
  drag: require('@/assets/icons/drag.svg'),
  settings: require('@/assets/icons/settings.svg'),
  print: require('@/assets/icons/print-big.svg'),
  pin: require('@/assets/icons/pin.svg'),
  phone: require('@/assets/icons/phone.svg'),
  'phone-classic': require('@/assets/icons/phone-classic.svg'),
  'phone-user': require('@/assets/icons/phone-user.svg'),
  'phone-hangup': require('@/assets/icons/phone-hangup.svg'),
  'phone-history': require('@/assets/icons/phone-history.svg'),
  'phone-stats': require('@/assets/icons/phone-stats.svg'),
  'phone-plus': require('@/assets/icons/phone-plus.svg'),
  'earth-globe': require('@/assets/icons/earth-globe.svg'),
  'phone-contact-add': require('@/assets/icons/phone-contact-add.svg'),
  'phone-exit': require('@/assets/icons/phone-exit.svg'),
  share: require('@/assets/icons/share-big.svg'),
  download: require('@/assets/icons/download.svg'),
  active: require('@/assets/icons/active.svg'),
  edit: require('@/assets/icons/edit.svg'),
  flag: require('@/assets/icons/flag.svg'),
  filters: require('@/assets/icons/filters.svg'),
  'flag-filled': require('@/assets/icons/flag-filled.svg'),
  search: require('@/assets/icons/search.svg'),
  table: require('@/assets/icons/table.svg'),
  map: require('@/assets/icons/notactive.svg'),
  layers: require('@/assets/icons/layers.svg'),
  info: require('@/assets/icons/inform.svg'),
  information: require('@/assets/icons/information.svg'),
  leaderboard: require('@/assets/icons/leaderboard.svg'),
  trash: require('@/assets/icons/delete.svg'),
  organization: require('@/assets/icons/my-organization.svg'),
  admin: require('@/assets/icons/admin.svg'),
  history: require('@/assets/icons/history.svg'),
  cancel: require('@/assets/icons/big.svg'),
  help: require('@/assets/icons/help.svg'),
  up: require('@/assets/icons/up.svg'),
  down: require('@/assets/icons/down.svg'),
  updown: require('@/assets/icons/updown.svg'),
  'go-case': require('@/assets/icons/replace-case.svg'),
  'map-buffer': require('@/assets/icons/map-buffer.svg'),
  'map-circle': require('@/assets/icons/map-circle.svg'),
  'map-poly': require('@/assets/icons/map-poly.svg'),
  'map-rect': require('@/assets/icons/map-rect.svg'),
  'map-sweep': require('@/assets/icons/map-sweep.svg'),
  'map-undo': require('@/assets/icons/map-undo.svg'),
  'map-redo': require('@/assets/icons/map-redo.svg'),
  otherorg: require('@/assets/icons/other-org.svg'),
  dialer: require('@/assets/icons/dialer.svg'),
  hangup: require('@/assets/icons/hangup.svg'),
  time: require('@/assets/icons/time.svg'),
  logout: require('@/assets/icons/logout.svg'),
  plane: require('@/assets/icons/plane.svg'),
  news: require('@/assets/icons/news.svg'),
  'sticky-note-solid': require('@/assets/icons/sticky-note-solid.svg'),
};

/* eslint-enable global-require */
export const ICONS = Object.fromEntries(
  Object.entries(ICON_MAP).map(([key]) => [snakeCase(key), key]),
);
export const ICON_SIZES = [
  'xxs',
  'xs',
  'tiny',
  'sm',
  'small',
  'md',
  'medium',
  'lg',
  'large',
  'xl',
];
export const BUTTON_STYLES = ['primary', 'danger', 'warning', 'link', 'bare'];
export const BUTTON_SIZES = {
  SM: 'small',
  MD: 'medium',
  LG: 'large',
};
export const BUTTON_VARIANTS = {
  SOLID: 'solid',
  OUTLINE: 'outline',
  OUTLINE_DARK: 'outline-dark',
  TEXT: 'text',
};
