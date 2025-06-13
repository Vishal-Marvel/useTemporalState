import { useState, useCallback, useEffect } from "react";

interface TemporalOptions<T> {
  limit?: number; // Maximum number of states to keep in history
  shouldAddToHistory?: (prev: T, next: T) => boolean; // Custom comparison to decide if state should be added to history
}

/**
 * useTemporalState is a custom React hook that manages state with undo/redo capabilities,
 * and includes optional history compression to limit memory usage.
 *
 * @param initialValue The initial state value.
 * @param options Optional configuration for limiting history and controlling when changes are recorded.
 */
export default function useTemporalState<T>(
  initialValue: T,
  options: TemporalOptions<T> = {}
) {
  // Destructure options with defaults
  const { limit = 50, shouldAddToHistory = (prev, next) => prev !== next } =
    options;

  const [past, setPast] = useState<T[]>([]);      // Stack of previous states for undo
  const [present, setPresent] = useState<T>(initialValue); // Current state
  const [future, setFuture] = useState<T[]>([]);  // Stack of future states for redo

  /**
   * Set a new state and update past/future accordingly.
   * If shouldAddToHistory returns true, stores current present in past.
   * Resets future on new state to prevent branching.
   */
  const set = useCallback(
    (newState: T | ((prev: T) => T)) => {
      // Resolve new state
      const next =
        typeof newState === "function"
          ? (newState as (prev: T) => T)(present)
          : newState;

      // Only add to history if allowed by shouldAddToHistory
      if (!shouldAddToHistory(present, next)) {
        setPresent(next);
        return;
      }

      // Push present to past, and trim if exceeds limit
      const newPast = [...past, present];
      const trimmedPast =
        newPast.length > limit ? newPast.slice(-limit) : newPast;

      setPast(trimmedPast); // Update past
      setPresent(next);     // Update present
      setFuture([]);        // Clear redo stack
    },
    [present, past, limit, shouldAddToHistory]
  );

  /**
   * Undo the last change, moving present to future and restoring from past.
   */
  const undo = useCallback(() => {
    if (past.length === 0) return;

    const newPast = past.slice(0, -1);             // All except last
    const lastState = past[past.length - 1];       // Most recent previous state

    setPast(newPast);                              // Update past
    setFuture((f) => [present, ...f]);             // Push current present to front of future
    setPresent(lastState);                         // Restore last state from past
  }, [past, present]);

  /**
   * Redo the last undone change, restoring next state from future.
   */
  const redo = useCallback(() => {
    if (future.length === 0) return;

    const [nextState, ...restFuture] = future;     // Get next state and rest
    const newPast = [...past, present];            // Push current state to past
    const trimmedPast =
      newPast.length > limit ? newPast.slice(-limit) : newPast;

    setPast(trimmedPast);                          // Update past
    setFuture(restFuture);                         // Remove first item from future
    setPresent(nextState);                         // Restore future state
  }, [future, past, present, limit]);

  return {
    state: present,                 // Current state
    set,                            // Function to update state
    undo,                           // Undo function
    redo,                           // Redo function
    canUndo: past.length > 0,       // Boolean flag if undo is possible
    canRedo: future.length > 0,     // Boolean flag if redo is possible
  };
}
