export function forceFileDownload(response) {
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  let fileName = 'unknown';
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename=(.+)/);
    if (fileNameMatch.length === 2) {
      [, fileName] = fileNameMatch;
    }
  }
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.href = url;
  link.target = '_blank';
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
