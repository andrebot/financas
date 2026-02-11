import apiSlice, { prepareHeaders, baseQueryWithReauth } from "../../../src/client/features/apiSlice";
import type { RTKApi } from "../../../src/client/types/requests";
import { clearAccessToken } from "../../../src/client/features/authSlice";

// eslint-disable-next-line no-var
var mockBaseQuery: jest.Mock;

jest.mock('@reduxjs/toolkit/query/react', () => {
  const originalModule = jest.requireActual('@reduxjs/toolkit/query/react');

  mockBaseQuery = jest.fn();

  return {
    ...originalModule,
    fetchBaseQuery: jest.fn(() => mockBaseQuery),
  };
});

describe('prepareHeaders', () => {
  it('should prepare the headers for the API requests for simple non authenticated requests', () => {
    const headers = new Headers();
    const preparedHeaders = prepareHeaders(headers, { 
      getState: () => ({ 
        theme: 'light',
        auth: { accessToken: '123', user: null },
        [apiSlice.reducerPath]: {} as ReturnType<typeof apiSlice.reducer>
      }),
      extra: undefined,
      endpoint: '',
      type: 'query'
    } as RTKApi);

    expect(preparedHeaders?.get('Content-Type')).toBe('application/json');
    expect(preparedHeaders?.get('Authorization')).toBe('Bearer 123');
  });

  it('should not add the authorization header if the access token is not present', () => {
    const headers = new Headers();
    const preparedHeaders = prepareHeaders(headers, { 
      getState: () => ({ 
        theme: 'light',
        auth: { accessToken: null, user: null },
        [apiSlice.reducerPath]: {} as ReturnType<typeof apiSlice.reducer>
      }),
      extra: undefined,
      endpoint: '',
      type: 'query'
    } as RTKApi);

    expect(preparedHeaders?.get('Content-Type')).toBe('application/json');
    expect(preparedHeaders?.get('Authorization')).toBeNull();
  });
});

describe('baseQueryWithReauth', () => {
  const mockUnauthorizedResult = {
    error: {
      message: 'Unauthorized',
    },
    meta: {
      response: {
        status: 401,
      },
    },
  };
  let mockApi = {
    dispatch: jest.fn(),
  };
  let mockArgs = 'test';
  let mockExtraOptions = {};

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return the result of the base query', async () => {
    const mockResult = {
      data: 'test',
      meta: {
        response: {
          status: 200,
        },
      },
    };

    mockBaseQuery.mockResolvedValue(mockResult);

    const result = await baseQueryWithReauth(mockArgs, mockApi as any, mockExtraOptions);

    expect(result).toEqual(mockResult);
  });

  it('should refresh the token if the response is 401', async () => {
    const mockResultSuccess = {
      data: 'test',
      meta: {
        response: {
          status: 200,
        },
      },
    };

    mockBaseQuery.mockResolvedValueOnce(mockUnauthorizedResult);
    mockBaseQuery.mockResolvedValueOnce({
      data: {
        accessToken: 'new-token',
      },
    });
    mockBaseQuery.mockResolvedValueOnce(mockResultSuccess);

    const result = await baseQueryWithReauth(mockArgs, mockApi as any, mockExtraOptions);

    expect(result).toEqual(mockResultSuccess);
  });

  it('should logout the user if the token refresh fails', async () => {
    const mockResult = {
      error: {
        message: 'server error',
      },
    };

    mockBaseQuery.mockResolvedValueOnce(mockUnauthorizedResult);
    mockBaseQuery.mockResolvedValueOnce(mockResult);

    const result = await baseQueryWithReauth(mockArgs, mockApi as any, mockExtraOptions);

    expect(mockApi.dispatch).toHaveBeenCalledWith(clearAccessToken());
    expect(result).toEqual(mockUnauthorizedResult);
  });
});