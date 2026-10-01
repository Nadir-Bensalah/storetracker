import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useFetch, type UseFetchResult } from './useFetch';

interface User {
  id: number;
  name: string;
}

const users: User[] = [{ id: 1, name: 'Ada' }];

function respond(body: unknown, status = 200) {
  return Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
  } as Response);
}

const fetchMock = jest.fn<Promise<Response>, [string, RequestInit]>();

beforeEach(() => {
  fetchMock.mockReset();
  global.fetch = fetchMock as unknown as typeof fetch;
});

describe('useFetch', () => {
  it('starts loading, then exposes typed data', async () => {
    fetchMock.mockReturnValue(respond(users));
    const { result } = await renderHook(() => useFetch<User[]>('/api/users'));

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toEqual(users);
    expect(result.current.error).toBeNull();
  });

  it('turns an HTTP error status into an error', async () => {
    fetchMock.mockReturnValue(respond({}, 500));
    const { result } = await renderHook(() => useFetch<User[]>('/api/users'));

    await waitFor(() => expect(result.current.error?.message).toBe('HTTP 500'));
    expect(result.current.loading).toBe(false);
  });

  it('aborts the request when the component unmounts', async () => {
    fetchMock.mockReturnValue(new Promise(() => {}));
    const { unmount } = await renderHook(() => useFetch<User[]>('/api/users'));

    const signal = fetchMock.mock.calls[0]?.[1].signal;
    await unmount();
    expect(signal?.aborted).toBe(true);
  });

  it('aborts the previous request when the URL changes, so a late answer cannot win', async () => {
    fetchMock.mockReturnValueOnce(new Promise(() => {})).mockReturnValueOnce(respond(users));
    const { result, rerender } = await renderHook<UseFetchResult<User[]>, { url: string }>(
      ({ url }) => useFetch<User[]>(url),
      {
        initialProps: { url: '/api/users?page=1' },
      },
    );
    const firstSignal = fetchMock.mock.calls[0]?.[1].signal;

    await rerender({ url: '/api/users?page=2' });

    expect(firstSignal?.aborted).toBe(true);
    await waitFor(() => expect(result.current.data).toEqual(users));
  });

  it('refetches on demand', async () => {
    fetchMock.mockReturnValue(respond(users));
    const { result } = await renderHook(() => useFetch<User[]>('/api/users'));
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(() => result.current.refetch());

    expect(fetchMock).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(result.current.loading).toBe(false));
  });

  it('does not loop when options are passed inline', async () => {
    fetchMock.mockReturnValue(respond(users));
    const { result } = await renderHook(() =>
      useFetch<User[]>('/api/users', { headers: { Accept: 'application/json' } }),
    );

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[1].headers).toEqual({ Accept: 'application/json' });
  });
});
