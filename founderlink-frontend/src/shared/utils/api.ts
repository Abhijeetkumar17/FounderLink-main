export const extractApiData = <T>(response: any, fallback?: T): T => {
  const payload = response?.data;

  if (payload === undefined || payload === null) {
    return fallback as T;
  }

  if (typeof payload === 'object' && 'data' in payload) {
    return (payload.data ?? fallback) as T;
  }

  return payload as T;
};
