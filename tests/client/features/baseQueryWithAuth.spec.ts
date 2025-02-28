import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { loginApi } from '../../../src/client/features/login';

let mockBaseQuery = jest.fn();

jest.mock('@reduxjs/toolkit/query/react', () => ({
  fetchBaseQuery: jest.fn(() => mockBaseQuery),
}));

import baseQueryWithAuth from '../../../src/client/features/baseQueryWithAuth';
import { clearAccessToken } from "../../../src/client/features/authSlice";


jest.mock('../../../src/client/features/login', () => ({
  loginApi: {
    endpoints: {
      logout: {
        initiate: jest.fn(),
      },
    },
  },
}));

describe('baseQueryWithAuth', () => {
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

    const result = await baseQueryWithAuth(mockArgs, mockApi as any, mockExtraOptions);

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

    const result = await baseQueryWithAuth(mockArgs, mockApi as any, mockExtraOptions);

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

    const result = await baseQueryWithAuth(mockArgs, mockApi as any, mockExtraOptions);

    expect(mockApi.dispatch).toHaveBeenCalledWith(loginApi.endpoints.logout.initiate());
    expect(mockApi.dispatch).toHaveBeenCalledWith(clearAccessToken());
    expect(result).toEqual(mockUnauthorizedResult);
  });
});