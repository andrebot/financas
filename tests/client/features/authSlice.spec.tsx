import authReducer, { setAccessToken, clearAccessToken } from '../../../src/client/features/authSlice';

describe('authSlice', () => {
  it('should return the initial state', () => {
    expect(authReducer(undefined, { type: undefined })).toEqual({ accessToken: null });
  });

  it('should set the access token', () => {
    const previousState = { accessToken: null };
    expect(authReducer(previousState, setAccessToken('1234567890'))).toEqual({ accessToken: '1234567890' });
  });

  it('should clear the access token', () => {
    const previousState = { accessToken: '1234567890' };
    expect(authReducer(previousState, clearAccessToken())).toEqual({ accessToken: null });
  });
});
