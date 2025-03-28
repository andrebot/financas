import { reducer, initialState, ActionType } from '../../../../src/client/pages/settings/reducer';

describe('User settings reducer', () => {
  it('should return the initial state', () => {
    const result = reducer(initialState, { type: '' as any, payload: { key: 'firstName', value: 'John' } });

    expect(result).toEqual(initialState);
  });

  it('should update the first name', () => {
    const result = reducer(initialState, { type: ActionType.SET_PROPERTY, payload: { key: 'firstName', value: 'John' } });

    expect(result).toEqual({ ...initialState, firstName: 'John', isDirty: true });
  });

  it('should update the last name', () => {
    const result = reducer(initialState, { type: ActionType.SET_PROPERTY, payload: { key: 'lastName', value: 'Doe' } });

    expect(result).toEqual({ ...initialState, lastName: 'Doe', isDirty: true });
  });

  it('should update the email', () => {
    const result = reducer(initialState, { type: ActionType.SET_PROPERTY, payload: { key: 'email', value: 'john.doe@example.com' } });

    expect(result).toEqual({ ...initialState, email: 'john.doe@example.com', isDirty: true });
  });

  it('should set the first name error', () => {
    const result = reducer(initialState, { type: ActionType.SET_FIRST_NAME_ERROR, payload: 'Error' });

    expect(result).toEqual({ ...initialState, firstNameError: 'Error' });
  });

  it('should set the last name error', () => {
    const result = reducer(initialState, { type: ActionType.SET_LAST_NAME_ERROR, payload: 'Error' });

    expect(result).toEqual({ ...initialState, lastNameError: 'Error' });
  });

  it('should set the isDirty flag', () => {
    const result = reducer(initialState, { type: ActionType.SET_IS_DIRTY, payload: true });

    expect(result).toEqual({ ...initialState, isDirty: true });
  });

  it('should reset the state', () => {
    const result = reducer(initialState, { type: ActionType.RESET_STATE, payload: initialState });

    expect(result).toEqual(initialState);
  });
});
