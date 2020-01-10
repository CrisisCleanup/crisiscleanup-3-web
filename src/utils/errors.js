export function getErrorMessage(error) {
  if (error.response.status === 500) {
    return i18n.t('info.error_500');
  }
  return error.response.data.errors[0].message[0];
}
