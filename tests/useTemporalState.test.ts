import { renderHook, act } from "@testing-library/react";
import useTemporalState from "../src/useTemporalState";

describe("useTemporalState", () => {
  it("should initialize with given state", () => {
    const { result } = renderHook(() => useTemporalState(0));
    expect(result.current.state).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(false);
  });

  it("should update state and allow undo", () => {
    const { result } = renderHook(() => useTemporalState(0));

    act(() => result.current.set(1));
    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(true);

    act(() => result.current.undo());
    expect(result.current.state).toBe(0);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.canRedo).toBe(true);
  });
  
  it("should do nothing if redo is called without future", () => {
    const { result } = renderHook(() => useTemporalState(1));

    act(() => {
      result.current.redo(); // no future yet
    });

    expect(result.current.state).toBe(1);
  });

  it("should redo state after undo", () => {
    const { result } = renderHook(() => useTemporalState(0));

    act(() => result.current.set(1));
    act(() => result.current.undo());
    act(() => result.current.redo());

    expect(result.current.state).toBe(1);
    expect(result.current.canRedo).toBe(false);
  });

  it("should not add state to history if shouldAddToHistory returns false", () => {
    const { result } = renderHook(() =>
      useTemporalState(0, {
        shouldAddToHistory: (prev, next) => false,
      })
    );

    act(() => result.current.set(1));
    expect(result.current.state).toBe(1);
    expect(result.current.canUndo).toBe(false);
  });

  it("should respect history limit", () => {
    const { result } = renderHook(() => useTemporalState(0, { limit: 3 }));

    act(() => result.current.set(1));
    act(() => result.current.set(2));
    act(() => result.current.set(3));
    act(() => result.current.set(4));

    expect(result.current.canUndo).toBe(true);
    act(() => result.current.undo());
    expect(result.current.state).toBe(3);
  });
});
