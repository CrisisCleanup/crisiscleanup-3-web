import { type AxiosResponse } from 'axios';

export function forceFileDownload(response: AxiosResponse) {
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  const contentDisposition = response.headers['content-disposition'];
  let fileName = 'unknown';
  if (contentDisposition) {
    const fileNameMatch = /filename=(.+)/.exec(contentDisposition);
    if (fileNameMatch?.length === 2) {
      [, fileName] = fileNameMatch;
    }
  }

  link.setAttribute('download', fileName);
  document.body.append(link);
  link.href = url;
  link.target = '_blank';
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function convertToCSV(objectArray: any[] | string) {
  const array =
    typeof objectArray !== 'object' ? JSON.parse(objectArray) : objectArray;
  let string_ = '';

  for (const element of array) {
    let line = '';
    for (const index of Object.keys(element)) {
      if (line !== '') line += ',';
      line += element[index];
    }

    string_ += `${line}\r\n`;
  }

  return string_;
}

export function exportCSVFile(
  headers: Record<any, any>,
  items: any[],
  fileTitle: string,
) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  const jsonObject = JSON.stringify(items);

  const csv = convertToCSV(jsonObject);

  const exportedFilename = `${fileTitle}.csv` || 'export.csv';

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    // Feature detection
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', exportedFilename);
    link.style.visibility = 'hidden';
    document.body.append(link);
    link.click();
    link.remove();
  }
}
