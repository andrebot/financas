import React, { useReducer } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import FormControl from '@mui/material/FormControl';
import { useSnackbar } from 'notistack';
import { toggleTheme } from '../../features/themeSlice';
import { useAuth } from '../../hooks/authContext';
import {
  HorizontalContainer,
  SettingsMain,
  SettingsSection,
  TextFieldStyled,
  InfoButton,
  MaterialUISwitch,
  ConfigSection,
  ThemeFormControl,
  ThemeFormControlLabel,
} from './styledComponents';
import { useUpdateUserMutation, useDeleteAccountMutation } from '../../features/login';
import { regExpEmail } from '../../utils/validators';
import { reducer, initialState, ActionType } from './reducer';
import { useModal } from '../../components/modal/modal';
import ChangePasswordModal from './changePasswordModal';
import useLogout from '../../hooks/useLogout';
import ConfirmDeleteAccount from './confirmDeleteAccountModal';
import { RootState } from '../../features/store';

const {
  SET_FIRST_NAME_ERROR,
  SET_LAST_NAME_ERROR,
  SET_PROPERTY,
  SET_IS_DIRTY,
  RESET_STATE,
} = ActionType;

export default function Settings(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const { user, setUser } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const { handleLogout } = useLogout();
  const storeDispatch = useDispatch();
  const theme = useSelector((state: RootState) => state.theme);
  const [state, dispatch] = useReducer(reducer, {
    ...initialState,
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
  } as typeof initialState);
  const { showModal } = useModal();
  const [updateUser, { isLoading }] = useUpdateUserMutation();
  const [, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const validatorMap = {
    firstName: (value: string) => validateName(value, 'firstNameRequired', SET_FIRST_NAME_ERROR),
    lastName: (value: string) => validateName(value, 'lastNameRequired', SET_LAST_NAME_ERROR),
  };

  /**
   * Validates the name field.
   *
   * @param name - The name value.
   * @param key - The key of the error action.
   * @param errorAction - The error action.
   */
  const validateName = (
    name: string,
    key: string,
    errorAction: ActionType.SET_FIRST_NAME_ERROR | ActionType.SET_LAST_NAME_ERROR,
  ) => {
    if (name.length === 0) {
      dispatch({ type: errorAction, payload: t(key) });

      return false;
    }

    return true;
  };

  /**
   * Handles the change event for the input fields.
   *
   * @remarks
   * This method expects the input fields to have a name attribute matching
   * the keys of the state object and the validatorMap object.
   * ValidatorMap is a map of the input field names to the validation functions.
   *
   * @param e - The change event.
   */
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const key = e.target.name;
    const { value } = e.target;
    const validator = validatorMap[key as keyof typeof validatorMap];

    if (validator) {
      validator(value);
    }

    dispatch({
      type: SET_PROPERTY,
      payload: { key, value },
    });
  };

  /**
   * Handles the cancel action. Resets the state to the initial state.
   */
  const handleCancel = () => {
    dispatch({
      type: RESET_STATE,
      payload: {
        firstName: user!.firstName,
        lastName: user!.lastName,
        email: user!.email,
      },
    });
  };

  /**
   * Validates the form.
   *
   * @returns true if the form is valid, false otherwise.
   */
  const validateForm = () => {
    const { firstName, lastName, email } = state;

    return firstName && lastName && email && regExpEmail.test(email);
  };

  /**
   * Opens the change password modal.
   */
  const openChangePasswordModal = () => {
    showModal(<ChangePasswordModal />);
  };

  /**
   * Handles the save action. Validates the form and then updates the user in the state.
   *
   * @remarks
   * If any error occurs, the error message is displayed using the enqueueSnackbar function.
   */
  const handleSave = async () => {
    if (!state.isDirty || !validateForm()) {
      return;
    }

    try {
      const updatedUser = {
        id: user!.id,
        firstName: state.firstName,
        lastName: state.lastName,
        email: state.email,
      };

      const result = await updateUser(updatedUser);

      if ('data' in result) {
        enqueueSnackbar(t('settingsUpdated'), { variant: 'success' });
        dispatch({ type: SET_IS_DIRTY, payload: false });
        setUser({
          ...user!,
          firstName: state.firstName,
          lastName: state.lastName,
          email: state.email,
        });
      } else {
        enqueueSnackbar(t('internalError'), { variant: 'error' });
      }
    } catch {
      enqueueSnackbar(t('internalError'), { variant: 'error' });
    }
  };

  /**
   * Opens the confirm delete account modal.
   */
  const openConfirmDeleteAccountModal = () => {
    showModal(<ConfirmDeleteAccount handleLogout={handleLogout} />);
  };

  /**
   * Handles the change language action.
   *
   * @param e - The change event. This comes from the RadioGroup component.
   */
  const handleChangeLanguage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    i18n.changeLanguage(value);
  };

  /**
   * Handles the change theme action.
   */
  const handleChangeTheme = () => {
    storeDispatch(toggleTheme());
  };

  return (
    <SettingsMain>
      <SettingsSection elevation={3}>
        <Typography variant="h3">{t('settingInfoTitle')}</Typography>
        <HorizontalContainer>
          <TextFieldStyled
            label={t('firstName')}
            variant="outlined"
            value={state.firstName}
            name="firstName"
            onChange={handleFormChange}
            error={!!state.firstNameError}
            helperText={state.firstNameError}
          />
          <TextFieldStyled
            label={t('lastName')}
            variant="outlined"
            value={state.lastName}
            name="lastName"
            onChange={handleFormChange}
            error={!!state.lastNameError}
            helperText={state.lastNameError}
          />
        </HorizontalContainer>
        <TextField
          fullWidth
          label={t('email')}
          variant="outlined"
          type="email"
          value={state.email}
          name="email"
          disabled
        />
        <HorizontalContainer>
          <InfoButton
            variant="outlined"
            onClick={handleCancel}
            disabled={isLoading || isDeleting}
          >
            {t('cancel')}
          </InfoButton>
          <InfoButton
            variant="contained"
            disabled={!state.isDirty || isLoading || isDeleting}
            onClick={handleSave}
            aria-label="save"
          >
            {isLoading ? <CircularProgress size={20} color="inherit" /> : t('save')}
          </InfoButton>
        </HorizontalContainer>
        <Button
          fullWidth
          variant="contained"
          onClick={openChangePasswordModal}
        >
          {t('changePassword')}
        </Button>
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={openConfirmDeleteAccountModal}
        >
          {t('deleteAccount')}
        </Button>
      </SettingsSection>
      <ConfigSection elevation={3}>
        <Typography variant="h3">{t('configuration')}</Typography>
        <FormControl>
          <FormLabel>{t('language')}</FormLabel>
          <RadioGroup
            name="language"
            row
            onChange={handleChangeLanguage}
            value={i18n.language}
          >
            <FormControlLabel value="en-US" control={<Radio />} label={t('english')} />
            <FormControlLabel value="pt" control={<Radio />} label={t('portuguese')} />
          </RadioGroup>
        </FormControl>
        <ThemeFormControl>
          <ThemeFormControlLabel
            control={<MaterialUISwitch checked={theme === 'dark'} />}
            label={t('theme')}
            labelPlacement="start"
            onChange={handleChangeTheme}
          />
        </ThemeFormControl>
      </ConfigSection>
    </SettingsMain>
  );
}
