export function getErrorMessage(error) {
  if (!error.response || !error.response.status) {
    return window.vue.$i18n.t('info.unknown_error');
  }
  if (error.response.status === 500) {
    return window.vue.$i18n.t('info.error_500');
  }

  const message = Array.isArray(error.response.data.errors[0])
    ? error.response.data.errors[0].message[0]
    : error.response.data.errors[0].message;

  if (error.response.status === 400) {
    // Show the error field, unless it is 'non_field_errors'
    let respone = '';
    error.response.data.errors.forEach((e) => {
      let { field } = e;
      field = field === 'non_field_errors' ? '' : `${field}: `;
      respone = `${respone}${field}${e.message}<br>`;
    });
    return respone;
  }
  return message;
}
