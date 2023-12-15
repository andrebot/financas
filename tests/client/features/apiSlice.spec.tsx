import backendAPISlice from '../../../src/client/features/apiSlice';

describe('backendAPISlice', () => {
  it('should be defined', () => {
    expect(backendAPISlice).toBeDefined();
  });

  it('should have the correct base URL', () => {
    expect(backendAPISlice.reducerPath).toBe('api');
  });
});
