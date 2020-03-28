const ROOT = process.env.VUE_APP_API_BASE_URL;

const getApiUrl = (path) => {
  const rootUrl = new URL(path, ROOT).toString();
  const getUrl = (endpoint) => {
    if (endpoint === undefined) {
      return rootUrl.slice(0, rootUrl.length - 1);
    }
    const fullUrl = new URL(endpoint, rootUrl).toString();
    return fullUrl;
  };
  return getUrl;
};

export const AgentApi = (endpoint) => getApiUrl('agents/')(endpoint);
export const PhoneApi = (endpoint) => getApiUrl('phone/')(endpoint);
export const IDPApi = (endpoint) => getApiUrl('idp/')(endpoint);
