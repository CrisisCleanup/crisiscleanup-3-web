import * as Sentry from '@sentry/browser';
import { i18n } from '../main';

export function getErrorMessage(error: any) {
  if (!error.response || !error.response.status) {
    Sentry.captureException(error);
    // If (window.vue.$log) {
    //   window.vue.$log.debug(error);
    // }
    return i18n.global.t('info.unknown_error');
  }

  if (error.response.status === 500) {
    Sentry.captureException(error);
    // If (window.vue.$log) {
    //   window.vue.$log.debug(error);
    // }
    return i18n.global.t('info.error_500');
  }

  const _errors = error.response.data.errors as { [key: string]: string }[];
  const message = Array.isArray(_errors[0])
    ? _errors[0].message[0]
    : _errors[0].message;

  if (error.response.status === 400) {
    // Show the error field, unless it is 'non_field_errors'
    let response = '';
    for (const e of _errors) {
      let { field } = e;
      field = field === 'non_field_errors' ? '' : `${field}: `;
      response = `${response}${field}${e.message}<br>`;
    }
    return response;
  }

  return message;
}
