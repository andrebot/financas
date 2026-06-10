import { TRANSACTION_TYPES, TransactionFormActionType } from '../../../enums';
import { regExpNameWithNumbers } from '../../../utils/validators';
import type {
  TransactionActionFunction,
  TransactionFormState,
  TransactionFormAction,
  Transaction,
} from '../../../types';

/** Blank form state used when opening the form for a new transaction. */
export const initialTransactionFormState: TransactionFormState = {
  name: '',
  value: 0,
  type: undefined,
  categoryId: 0,
  bankAccountId: 0,
  date: new Date(),
  nameError: '',
  dateError: '',
  valueError: '',
  categoryError: '',
  bankAccountError: '',
  typeError: '',
};

/**
 * Sets the transaction name and validates it against the allowed name pattern.
 * Clears any existing name error on each call; sets nameRequired if blank or
 * whitespace-only, and nameInvalid if the value fails the name regex.
 *
 * @param state - Current form state.
 * @param payload - New name value typed by the user.
 * @returns Updated form state with the new name and any relevant error.
 */
function setName(state: TransactionFormState, payload: string): TransactionFormState {
  const nextState: TransactionFormState = { ...state, name: payload, nameError: '' };

  if (!payload || payload.trim().length === 0) {
    nextState.nameError = 'nameRequired';
  }

  if (payload && !regExpNameWithNumbers.test(payload)) {
    nextState.nameError = 'nameInvalid';
  }

  return nextState;
}

/**
 * Sets the transaction monetary value and validates it is a positive non-zero number.
 * Coerces null/undefined to 0 and sets valueRequired when zero or NaN,
 * or valueMustBeGreaterThanZero when negative.
 *
 * @param state - Current form state.
 * @param payload - New numeric value entered by the user.
 * @returns Updated form state with the new value and any relevant error.
 */
function setValue(
  state: TransactionFormState,
  payload: number | undefined | null,
): TransactionFormState {
  const nextValue: number = payload ?? 0;
  const nextState: TransactionFormState = { ...state, value: nextValue, valueError: '' };

  if (Number.isNaN(nextValue) || nextValue === 0) {
    nextState.valueError = 'valueRequired';
    nextState.value = 0;
  }

  if (nextValue < 0) {
    nextState.valueError = 'valueMustBeGreaterThanZero';
  }

  return nextState;
}

/**
 * Sets the transaction type and validates it is a known TRANSACTION_TYPES value.
 * Sets typeRequired when absent and typeInvalid when the value is not in the enum.
 *
 * @param state - Current form state.
 * @param payload - Transaction type selected by the user.
 * @returns Updated form state with the new type and any relevant error.
 */
function setType(
  state: TransactionFormState,
  payload: TRANSACTION_TYPES,
): TransactionFormState {
  const nextState: TransactionFormState = { ...state, type: payload, typeError: '' };

  if (!payload) {
    nextState.typeError = 'typeRequired';
  }

  if (payload && !Object.values(TRANSACTION_TYPES).includes(payload)) {
    nextState.typeError = 'typeInvalid';
  }

  return nextState;
}

/**
 * Sets the linked category id on the form state.
 * Sets categoryRequired when the value is falsy or NaN.
 *
 * @param state - Current form state.
 * @param payload - Category id selected by the user.
 * @returns Updated form state with the new category id and any relevant error.
 */
function setCategoryId(state: TransactionFormState, payload: number): TransactionFormState {
  const nextState: TransactionFormState = { ...state, categoryId: payload, categoryError: '' };

  if (!payload || isNaN(payload)) {
    nextState.categoryError = 'categoryRequired';
  }

  return nextState;
}

/**
 * Sets the linked bank account id on the form state.
 * Sets bankAccountRequired when the value is falsy or NaN.
 *
 * @param state - Current form state.
 * @param payload - Bank account id selected by the user.
 * @returns Updated form state with the new bank account id and any relevant error.
 */
function setBankAccountId(state: TransactionFormState, payload: number): TransactionFormState {
  const nextState: TransactionFormState = { ...state, bankAccountId: payload, bankAccountError: '' };

  if (!payload || isNaN(payload)) {
    nextState.bankAccountError = 'bankAccountRequired';
  }

  return nextState;
}

/**
 * Sets the transaction date and validates it is present and not in the future.
 * Defaults to today when the payload is null or undefined and sets dateRequired;
 * sets dateMustNotBeInTheFuture when the date is ahead of the current moment.
 *
 * @param state - Current form state.
 * @param payload - Date selected by the user via the date picker.
 * @returns Updated form state with the new date and any relevant error.
 */
function setDate(
  state: TransactionFormState,
  payload: Date | undefined | null,
): TransactionFormState {
  const nextState: TransactionFormState = { ...state, date: payload ?? new Date(), dateError: '' };

  if (!payload) {
    nextState.dateError = 'dateRequired';
  }

  if (payload && payload > new Date()) {
    nextState.dateError = 'dateMustNotBeInTheFuture';
  }

  return nextState;
}

/**
 * Populates the form with the fields of an existing transaction for editing.
 * Resets all error fields so previously shown validation messages are cleared.
 * Note: categoryId and bankAccountId are reset to 0 because the Transaction
 * type does not currently carry those ids back from the list endpoint.
 *
 * @param state - Current form state.
 * @param payload - The transaction to load into the form.
 * @returns Form state pre-filled with the transaction's data.
 */
function editTransaction(
  state: TransactionFormState,
  payload: Transaction,
): TransactionFormState {
  return {
    ...state,
    id: payload.id,
    name: payload.name,
    value: payload.value,
    type: payload.type,
    date: new Date(payload.date),
    categoryId: payload.categoryId!,
    bankAccountId: payload.accountId,
    nameError: '',
    valueError: '',
    typeError: '',
    dateError: '',
    categoryError: '',
    bankAccountError: '',
  };
}

/**
 * Runs all field validators against the current state in a single pass.
 * Used before submission to ensure every field is checked even if the user
 * skipped some inputs without triggering their individual onChange handlers.
 *
 * @param state - The form state to validate.
 * @returns A new state with all error fields populated where validation failed.
 */
export function validateTransactionFormState(state: TransactionFormState): TransactionFormState {
  return setBankAccountId(
    setCategoryId(
      setType(
        setDate(
          setValue(
            setName(state, state.name),
            state.value,
          ),
          state.date,
        ),
        state.type as TRANSACTION_TYPES,
      ),
      state.categoryId,
    ),
    state.bankAccountId,
  );
}

/**
 * Returns true if any field in the form state carries a validation error message.
 * Used after validateTransactionFormState to decide whether submission should proceed.
 *
 * @param state - The validated form state to inspect.
 * @returns True when at least one error field is non-empty.
 */
export function hasTransactionFormErrors(state: TransactionFormState): boolean {
  return Boolean(
    state.nameError
    || state.valueError
    || state.typeError
    || state.dateError
    || state.categoryError
    || state.bankAccountError,
  );
}

const actionMap: Record<TransactionFormActionType, TransactionActionFunction> = {
  [TransactionFormActionType.SET_NAME]: setName,
  [TransactionFormActionType.SET_VALUE]: setValue,
  [TransactionFormActionType.SET_TYPE]: setType,
  [TransactionFormActionType.SET_CATEGORY_ID]: setCategoryId,
  [TransactionFormActionType.SET_BANK_ACCOUNT_ID]: setBankAccountId,
  [TransactionFormActionType.SET_DATE]: setDate,
  [TransactionFormActionType.VALIDATE]: validateTransactionFormState,
  [TransactionFormActionType.EDIT]: editTransaction,
  [TransactionFormActionType.RESET]: () => ({ ...initialTransactionFormState }),
};

/**
 * Reducer for the transaction form. Delegates each action type to its dedicated
 * handler via actionMap, keeping validation logic co-located with the field it owns.
 *
 * @param state - Current form state.
 * @param action - Dispatched action with its typed payload.
 * @returns The next form state produced by the matching handler, or the unchanged state.
 */
export function transactionFormReducer(
  state: TransactionFormState,
  action: TransactionFormAction,
): TransactionFormState {
  const func = actionMap[action.type];

  if (func) {
    return func(state, action.payload);
  }

  return state;
}
