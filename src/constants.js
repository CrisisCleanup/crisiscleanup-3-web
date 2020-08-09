// @flow
/**
 * Various Constants
 */

import { snakeCase } from 'lodash';

export const TEXT_VARIANTS = ['h1', 'h2', 'h3', 'h4', 'body', 'bodysm'];

export const ICON_MAP = {
  dashboard: require('@/assets/icons/dashboard.svg'),
  cases: require('@/assets/icons/cases.svg'),
  reports: require('@/assets/icons/reports.svg'),
  calendar: require('@/assets/icons/calendar.svg'),
  call: require('@/assets/icons/call.svg'),
  chat: require('@/assets/icons/chat.svg'),
  drag: require('@/assets/icons/drag.svg'),
  settings: require('@/assets/icons/settings.svg'),
  print: require('@/assets/icons/print-big.svg'),
  pin: require('@/assets/icons/pin.svg'),
  phone: require('@/assets/icons/phone.svg'),
  'phone-user': require('@/assets/icons/phone-user.svg'),
  'phone-hangup': require('@/assets/icons/phone-hangup.svg'),
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
};
/* eslint-enable global-require */

export const ICONS = Object.fromEntries(
  Object.entries(ICON_MAP).map(([key]) => [snakeCase(key), key]),
);

export const ICON_SIZES = [
  'xxs',
  'xs',
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
  TEXT: 'text',
};

export type ButtonVariant = $Values<BUTTON_VARIANTS>;
export type ButtonSize = $Values<BUTTON_SIZES>;
export type Icon = $Values<Icons>;
