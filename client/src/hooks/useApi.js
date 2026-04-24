import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { getErrorMessage } from "../utils/apiError";

/**
 * Custom hook for API data fetching — eliminates repeated
 * loading/error/fetch patterns across pages.
 *
 * Usage:
 *   const { data, loading, refetch } = useApi(getMyBookings);
 *   const { data, loading, refetch } = useApi(() => getMessMenu("A"));
 */
const useApi = (apiFn, { immediate = true, onError, dataKey } = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFn(...args);
        const result = dataKey ? response.data[dataKey] : response.data;
        setData(result);
        return result;
      } catch (err) {
        const msg = getErrorMessage(err, "Request failed");
        setError(msg);
        if (onError) {
          onError(msg);
        } else {
          toast.error(msg);
        }
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn, dataKey, onError]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, []);

  return { data, loading, error, execute, refetch: execute, setData };
};

export default useApi;
