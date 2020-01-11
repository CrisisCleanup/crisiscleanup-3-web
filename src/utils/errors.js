export function getErrorMessage(error) {
  if (error.response.status === 500) {
    return window.vue.i18n.t('info.error_500');
  }
  return error.response.data.errors[0].message[0];
}
