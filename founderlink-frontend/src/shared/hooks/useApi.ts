import { useState } from 'react';

export const useApi = <T>(apiFunc: (...args: any[]) => Promise<any>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  const execute = async (...args: any[]) => {
    try {
      setLoading(true);
      const res = await apiFunc(...args);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
