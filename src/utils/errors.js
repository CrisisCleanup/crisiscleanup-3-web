import * as Sentry from '@sentry/browser';

export function getErrorMessage(error) {
  if (!error.response || !error.response.status) {
    Sentry.captureException(error);
    if (window.vue.$log) {
      window.vue.$log.debug(error);
    }
    return window.vue.$i18n.t('info.unknown_error');
  }
  if (error.response.status === 500) {
    Sentry.captureException(error);
    if (window.vue.$log) {
      window.vue.$log.debug(error);
    }
    return window.vue.$i18n.t('info.error_500');
  }

  const message = Array.isArray(error.response.data.errors[0])
    ? error.response.data.errors[0].message[0]
    : error.response.data.errors[0].message;

  if (error.response.status === 400) {
    // Show the error field, unless it is 'non_field_errors'
    let response = '';
    error.response.data.errors.forEach((e) => {
      let { field } = e;
      field = field === 'non_field_errors' ? '' : `${field}: `;
      response = `${response}${field}${e.message}<br>`;
    });
    return response;
  }
  return message;
}
