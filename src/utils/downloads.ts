import { AxiosResponse } from "axios";

export function forceFileDownload(response: AxiosResponse) {
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  const contentDisposition = response.headers["content-disposition"];
  let fileName = "unknown";
  if (contentDisposition) {
    const fileNameMatch = contentDisposition.match(/filename=(.+)/);
    if (fileNameMatch?.length === 2) {
      [, fileName] = fileNameMatch;
    }
  }
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.href = url;
  link.target = "_blank";
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function convertToCSV(objArray: any[] | string) {
  const array = typeof objArray !== "object" ? JSON.parse(objArray) : objArray;
  let str = "";

  for (let i = 0; i < array.length; i++) {
    let line = "";
    Object.keys(array[i]).forEach((index) => {
      if (line !== "") line += ",";
      line += array[i][index];
    });
    str += `${line}\r\n`;
  }
  return str;
}

export function exportCSVFile(
  headers: Record<any, any>,
  items: any[],
  fileTitle: string
) {
  if (headers) {
    items.unshift(headers);
  }

  // Convert Object to JSON
  const jsonObject = JSON.stringify(items) as string;

  const csv = convertToCSV(jsonObject);

  const exportedFilename = `${fileTitle}.csv` || "export.csv";

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    // feature detection
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", exportedFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
