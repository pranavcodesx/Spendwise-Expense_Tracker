import { useEffect, useState } from 'react';
import { getErrorMessage } from '../utils/errors';

// useFetch(() => api.call(), [dependencies]) -> { data, loading, error, reload }
export default function useFetch(fetcher, deps) {
  const [state, setState] = useState({ data: null, loading: true, error: '' });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    fetcher()
      .then((data) => alive && setState({ data, loading: false, error: '' }))
      .catch((err) => alive && setState((s) => ({ ...s, loading: false, error: getErrorMessage(err) })));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);

  return { ...state, reload: () => setTick((t) => t + 1) };
}
