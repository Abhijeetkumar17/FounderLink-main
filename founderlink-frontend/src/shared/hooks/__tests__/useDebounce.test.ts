import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDebounce } from '../useDebounce';

describe('useDebounce hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // ═══════════════════════════════════════════════════════════
  //  Normal: Debounces value after delay
  // ═══════════════════════════════════════════════════════════

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500));
    expect(result.current).toBe('hello');
  });

  it('should update debounced value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } },
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 300 });

    // Before delay: should still be old value
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('initial');

    // After delay: should be new value
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('updated');
  });

  it('should reset timer on rapid changes (only last value applies)', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'a', delay: 300 } },
    );

    rerender({ value: 'b', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'c', delay: 300 });
    act(() => { vi.advanceTimersByTime(100); });

    rerender({ value: 'd', delay: 300 });

    // Only 100ms have passed since 'd' — should still show 'a'
    act(() => { vi.advanceTimersByTime(100); });
    expect(result.current).toBe('a');

    // Full delay from last change
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('d');
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Zero delay
  // ═══════════════════════════════════════════════════════════

  it('should update immediately with zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'start', delay: 0 } },
    );

    rerender({ value: 'immediate', delay: 0 });
    act(() => { vi.advanceTimersByTime(0); });
    expect(result.current).toBe('immediate');
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Empty string
  // ═══════════════════════════════════════════════════════════

  it('should handle empty string value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'filled', delay: 200 } },
    );

    rerender({ value: '', delay: 200 });
    act(() => { vi.advanceTimersByTime(200); });
    expect(result.current).toBe('');
  });

  // ═══════════════════════════════════════════════════════════
  //  Cleanup on unmount
  // ═══════════════════════════════════════════════════════════

  it('should clean up timeout on unmount (no memory leak)', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout');

    const { unmount, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'test', delay: 500 } },
    );

    rerender({ value: 'changed', delay: 500 });
    unmount();

    // clearTimeout should have been called during cleanup
    expect(clearTimeoutSpy).toHaveBeenCalled();
  });
});
