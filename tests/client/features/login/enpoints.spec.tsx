import testBuilder, {
  loginMutation,
  registerMutation,
  refreshTokenQuery,
  resetPasswordMutation,
  logoutMutation,
  updateUserMutation,
  changePasswordMutation,
  deleteAccountMutation,
} from '../../../../src/client/features/login/endpoints';

const mockBuilder = {
  query: jest.fn(() => ({})),
  mutation: jest.fn(() => ({})),
};
const tBuilder = testBuilder(mockBuilder as any);

describe('login endpoints', () => {
  it('should have all endpoints', () => {
    mockBuilder.query.mockReturnValue('test');
    mockBuilder.mutation.mockReturnValue('test');

    expect(tBuilder).toBeDefined();
    expect(tBuilder.login).toBeDefined();
    expect(tBuilder.register).toBeDefined();
    expect(tBuilder.refreshToken).toBeDefined();
    expect(tBuilder.resetPassword).toBeDefined();
    expect(tBuilder.logout).toBeDefined();
    expect(tBuilder.updateUser).toBeDefined();
    expect(tBuilder.changePassword).toBeDefined();
    expect(tBuilder.deleteAccount).toBeDefined();
    expect(mockBuilder.query).toHaveBeenCalledTimes(1);
    expect(mockBuilder.mutation).toHaveBeenCalledTimes(7);
  });

  it('should correctly prepare the login mutation request', () => {
    const body = {
      email: 'test@test.com',
      password: 'test',
    };
    const loginMutationExecuted = loginMutation(body);

    expect(loginMutationExecuted).toBeDefined();
    expect(loginMutationExecuted.url).toBe('/login');
    expect(loginMutationExecuted.method).toBe('POST');
    expect(loginMutationExecuted.body).toEqual(body);
  });

  it('should correctly prepare the register mutation request', () => {
    const body = {
      email: 'test@test.com',
      password: 'test',
      firstName: 'test',
      lastName: 'test',
    };
    const registerMutationExecuted = registerMutation(body);

    expect(registerMutationExecuted).toBeDefined();
    expect(registerMutationExecuted.url).toBe('/register');
    expect(registerMutationExecuted.method).toBe('POST');
    expect(registerMutationExecuted.body).toEqual(body);
  });

  it('should correctly prepare the refresh token query request', () => {
    const refreshTokenQueryExecuted = refreshTokenQuery();

    expect(refreshTokenQueryExecuted).toBeDefined();
    expect(refreshTokenQueryExecuted.url).toBe('/refresh-tokens');
    expect(refreshTokenQueryExecuted.method).toBe('POST');
  });

  it('should correctly prepare the reset password mutation request', () => {
    const body = {
      email: 'test@test.com',
    };
    const resetPasswordMutationExecuted = resetPasswordMutation(body);

    expect(resetPasswordMutationExecuted).toBeDefined();
    expect(resetPasswordMutationExecuted.url).toBe('/reset-password');
    expect(resetPasswordMutationExecuted.method).toBe('POST');
    expect(resetPasswordMutationExecuted.body).toEqual(body);
  });

  it('should correctly prepare the logout mutation request', () => {
    const logoutMutationExecuted = logoutMutation();

    expect(logoutMutationExecuted).toBeDefined();
    expect(logoutMutationExecuted.url).toBe('/logout');
    expect(logoutMutationExecuted.method).toBe('POST');
  });

  it('should correctly prepare the update user mutation request', () => {
    const body = {
      email: 'test@test.com',
      firstName: 'test',
      lastName: 'test',
      id: '1',
    };

    const updateUserMutationExecuted = updateUserMutation(body);

    expect(updateUserMutationExecuted).toBeDefined();
    expect(updateUserMutationExecuted.url).toBe(`/${body.id}`);
    expect(updateUserMutationExecuted.method).toBe('PUT');
    expect(updateUserMutationExecuted.body).toEqual({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
    });
  });

  it('should correctly prepare the change password mutation request', () => {
    const body = {
      email: 'test@test.com',
      password: 'test',
      newPassword: 'newTest',
      oldPassword: 'oldTest',
    };

    const changePasswordMutationExecuted = changePasswordMutation(body);

    expect(changePasswordMutationExecuted).toBeDefined();
    expect(changePasswordMutationExecuted.url).toBe('/change-password');
    expect(changePasswordMutationExecuted.method).toBe('POST');
    expect(changePasswordMutationExecuted.body).toEqual(body);
  });

  it('should correctly prepare the delete account mutation request', () => {
    const deleteAccountMutationExecuted = deleteAccountMutation('1');

    expect(deleteAccountMutationExecuted).toBeDefined();
    expect(deleteAccountMutationExecuted.url).toBe('/1');
    expect(deleteAccountMutationExecuted.method).toBe('DELETE');
  });
});
