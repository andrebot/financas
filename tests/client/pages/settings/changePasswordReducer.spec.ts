
import { reducer, initialState, ActionType } from '../../../../src/client/pages/settings/changePasswordReducer';

describe('Change Password Reducer', () => {
  it('should return the initial state', () => {
    const result = reducer(initialState, { type: '' as any, payload: { key: 'newPassword', value: '123456' } });

    expect(result).toEqual(initialState);
  });

  it('should update currentPassword', () => {
    const result = reducer(initialState, { type: ActionType.SET_PROPERTY, payload: { key: 'currentPassword', value: '123456' } });

    expect(result).toEqual({ ...initialState, currentPassword: '123456', isDirty: true });
  });

  it('should update newPassword', () => {
    const result = reducer(initialState, { type: ActionType.SET_PROPERTY, payload: { key: 'newPassword', value: '123456' } });

    expect(result).toEqual({ ...initialState, newPassword: '123456', isDirty: true });
  });
  
  it('should update confirmPassword', () => {
    const result = reducer(initialState, { type: ActionType.SET_PROPERTY, payload: { key: 'confirmPassword', value: '123456' } });

    expect(result).toEqual({ ...initialState, confirmPassword: '123456', isDirty: true });
  });
  
  it('should set the new password error', () => {
    const result = reducer(initialState, { type: ActionType.SET_NEW_PASSWORD_ERROR, payload: 'Error' });

    expect(result).toEqual({ ...initialState, newPasswordError: 'Error' });
  });
  
  it('should set the confirm password error', () => {
    const result = reducer(initialState, { type: ActionType.SET_CONFIRM_PASSWORD_ERROR, payload: 'Error' });

    expect(result).toEqual({ ...initialState, confirmPasswordError: 'Error' });
  });
});
