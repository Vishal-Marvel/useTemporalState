import { useState, useCallback } from "react";

interface TemporalOptions<T> {
  limit?: number;
  shouldAddToHistory?: (prev: T, next: T) => boolean;
}

/**
 * useTemporalState is a custom React hook that provides undo/redo state management with history compression.
 * @param initialValue The initial state value.
 * @param options Optional settings like history limit and change comparison.
 */
export default function useTemporalState<T>(
  initialValue: T,
  options: TemporalOptions<T> = {}
) {
  const { limit = 50, shouldAddToHistory = (prev, next) => prev !== next } = options;

  const [past, setPast] = useState<T[]>([]);
  const [present, setPresent] = useState<T>(initialValue);
  const [future, setFuture] = useState<T[]>([]);

  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      setPresent((prevPresent) => {
        const next =
          typeof newState === "function"
            ? (newState as (prev: T) => T)(prevPresent)
            : newState;

        if (!shouldAddToHistory(prevPresent, next)) return prevPresent;

        setPast((prev) => {
          const updated = [...prev, prevPresent];
          return updated.length > limit ? updated.slice(-limit) : updated;
        });

        setFuture([]);
        return next;
      });
    },
    [limit, shouldAddToHistory]
  );

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const newPast = prevPast.slice(0, -1);
      const lastState = prevPast[prevPast.length - 1];
      setFuture((f) => [present, ...f]);
      setPresent(lastState);
      return newPast;
    });
  }, [present]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const [nextState, ...restFuture] = prevFuture;
      setPast((p) => {
        const updated = [...p, present];
        return updated.length > limit ? updated.slice(-limit) : updated;
      });
      setPresent(nextState);
      return restFuture;
    });
  }, [present, limit]);

  return {
    state: present,
    set,
    undo,
    redo,
    canUndo: past.length > 0,
    canRedo: future.length > 0,
  };
}
