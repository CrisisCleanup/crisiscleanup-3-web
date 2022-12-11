export function getQueryString(parameters) {
  return Object.keys(parameters)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`,
    )
    .join('&');
}
