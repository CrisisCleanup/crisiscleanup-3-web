export function getErrorMessage(error) {
  if (error.response.status === 500) {
    return window.vue.$i18n.t('info.error_500');
  }
  if (error.response.status === 400) {
    return `${error.response.data.errors[0].field}:  ${error.response.data.errors[0].message[0]}`;
  }
  return error.response.data.errors[0].message[0];
}
