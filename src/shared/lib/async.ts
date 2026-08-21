import { useEffect, useState } from 'react';

export function delay<T>(value: T, milliseconds: number): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), milliseconds);
  });
}

export interface AsyncState<T> {
  data: T | undefined;
  isLoading: boolean;
}

export function useAsync<T>(
  loader: () => Promise<T>,
  dependencies: readonly unknown[]
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({ data: undefined, isLoading: true });

  useEffect(() => {
    let active = true;
    setState({ data: undefined, isLoading: true });

    void loader().then((data) => {
      if (active) {
        setState({ data, isLoading: false });
      }
    });

    return () => {
      active = false;
    };
  // The caller owns dependency identity, matching ngOnInit/subscribe usage.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return state;
}
