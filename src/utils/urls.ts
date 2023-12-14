export function getQueryString(parameters: Record<string, any>) {
  return Object.keys(parameters)
    .map(
      (key) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(parameters[key])}`,
    )
    .join('&');
}
