export function forceFileDownload(response) {
  const blob = new Blob([response.data], { type: response.data.type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  let fileName = 'unknown';
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename=(.+)/);
    if (fileNameMatch.length === 2) {
      [fileName] = fileNameMatch;
    }
  }
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
