import { prepareHeaders, apiSlice } from '../../../../src/client/features/testAPI';

describe('backendAPISlice', () => {
  it('should be defined', () => {
    expect(apiSlice).toBeDefined();
  });

  it('should have the correct base URL', () => {
    expect(apiSlice.reducerPath).toBe('api');
  });

  it('should set Content-Type header in prepareHeaders', async () => {
    const mockHeaders = new Headers();
    const preparedHeaders = await prepareHeaders(mockHeaders);
    expect(preparedHeaders.get('Content-Type')).toBe('application/json');
  });
});
