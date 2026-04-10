import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApi } from '../useApi';

describe('useApi hook', () => {
  // ═══════════════════════════════════════════════════════════
  //  Normal: Successful API call
  // ═══════════════════════════════════════════════════════════

  it('should initialize with null data, no loading, and no error', () => {
    const mockApi = vi.fn();
    const { result } = renderHook(() => useApi<string>(mockApi));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should set data after successful API call', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: { users: ['Alice', 'Bob'] } });
    const { result } = renderHook(() => useApi<{ users: string[] }>(mockApi));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toEqual({ users: ['Alice', 'Bob'] });
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockApi).toHaveBeenCalledOnce();
  });

  it('should set loading to true during execution', async () => {
    let resolvePromise: (value: any) => void;
    const pendingPromise = new Promise((resolve) => { resolvePromise = resolve; });
    const mockApi = vi.fn().mockReturnValue(pendingPromise);

    const { result } = renderHook(() => useApi(mockApi));

    // Start execution — don't await
    act(() => {
      result.current.execute();
    });

    // loading should be true while the promise is pending
    expect(result.current.loading).toBe(true);

    // Resolve and wait
    await act(async () => {
      resolvePromise!({ data: 'done' });
    });

    expect(result.current.loading).toBe(false);
  });

  it('should forward arguments to the API function', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: 'ok' });
    const { result } = renderHook(() => useApi(mockApi));

    await act(async () => {
      await result.current.execute('arg1', 42, { key: 'value' });
    });

    expect(mockApi).toHaveBeenCalledWith('arg1', 42, { key: 'value' });
  });

  // ═══════════════════════════════════════════════════════════
  //  Exception Handling
  // ═══════════════════════════════════════════════════════════

  it('should set error on API failure', async () => {
    const networkError = new Error('Network Error');
    const mockApi = vi.fn().mockRejectedValue(networkError);
    const { result } = renderHook(() => useApi(mockApi));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBe(networkError);
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('should clear loading on error', async () => {
    const mockApi = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = renderHook(() => useApi(mockApi));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.loading).toBe(false);
  });

  // ═══════════════════════════════════════════════════════════
  //  Boundary: Multiple calls
  // ═══════════════════════════════════════════════════════════

  it('should update data on subsequent successful calls', async () => {
    const mockApi = vi.fn()
      .mockResolvedValueOnce({ data: 'first' })
      .mockResolvedValueOnce({ data: 'second' });

    const { result } = renderHook(() => useApi<string>(mockApi));

    await act(async () => { await result.current.execute(); });
    expect(result.current.data).toBe('first');

    await act(async () => { await result.current.execute(); });
    expect(result.current.data).toBe('second');
  });

  it('should handle API returning null data gracefully', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: null });
    const { result } = renderHook(() => useApi(mockApi));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle API returning undefined data', async () => {
    const mockApi = vi.fn().mockResolvedValue({ data: undefined });
    const { result } = renderHook(() => useApi(mockApi));

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });
});
