import { DependencyList, useEffect, useState } from 'react';

export interface AsyncState<T> {
  data: T | undefined;
  isLoading: boolean;
}

/** Runs a deterministic service call and tracks the loading flag each page used to hold. */
export function useAsync<T>(load: () => Promise<T>, deps: DependencyList): AsyncState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    load().then(result => {
      if (!active) {
        return;
      }
      setData(result);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, isLoading };
}
