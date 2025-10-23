import { styled } from '@mui/material/styles';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Switch from '@mui/material/Switch';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import type { StyleCompProp } from '../../types';

export const SettingsMain = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'auto',
  paddingTop: '20px',
  gap: '20px',
  flexGrow: 1,
  [theme.breakpoints.down('sm')]: {
    paddingTop: '102px',
  },
}));

export const SettingsSection = styled(Paper)(() => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}));

export const HorizontalContainer = styled('div')(() => ({
  display: 'flex',
  gap: '10px',
}));

export const TextFieldStyled = styled(TextField)(() => ({
  flexGrow: '1',
}));

export const InfoButton = styled(Button)(() => ({
  flexGrow: '1',
}));

export const ChangePasswordModalContainer = styled(Paper)(({ theme }: StyleCompProp) => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  [theme.breakpoints.up('md')]: {
    maxWidth: '427px',
  },
}));

export const ChangePasswordModalTitle = styled(Typography)(() => ({
  marginBottom: '20px',
}));

export const ConfirmDeleteAccountContainer = styled(Paper)(() => ({
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
}));

export const ConfirmDeleteAccountTitle = styled(Typography)(() => ({
  alignSelf: 'center',
}));

export const MaterialUISwitch = styled(Switch)(({ theme }: StyleCompProp) => ({
  width: 62,
  height: 34,
  padding: 7,
  '& .MuiSwitch-switchBase': {
    margin: 1,
    padding: 0,
    transform: 'translateX(6px)',
    '&.Mui-checked': {
      color: '#fff',
      transform: 'translateX(22px)',
      '& .MuiSwitch-thumb:before': {
        backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
          '#fff',
        )}" d="M4.2 2.5l-.7 1.8-1.8.7 1.8.7.7 1.8.6-1.8L6.7 5l-1.9-.7-.6-1.8zm15 8.3a6.7 6.7 0 11-6.6-6.6 5.8 5.8 0 006.6 6.6z"/></svg>')`,
      },
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#aab4be',
        ...theme.applyStyles('dark', {
          backgroundColor: '#8796A5',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    backgroundColor: '#001e3c',
    width: 32,
    height: 32,
    '&::before': {
      content: "''",
      position: 'absolute',
      width: '100%',
      height: '100%',
      left: 0,
      top: 0,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="20" width="20" viewBox="0 0 20 20"><path fill="${encodeURIComponent(
        '#fff',
      )}" d="M9.305 1.667V3.75h1.389V1.667h-1.39zm-4.707 1.95l-.982.982L5.09 6.072l.982-.982-1.473-1.473zm10.802 0L13.927 5.09l.982.982 1.473-1.473-.982-.982zM10 5.139a4.872 4.872 0 00-4.862 4.86A4.872 4.872 0 0010 14.862 4.872 4.872 0 0014.86 10 4.872 4.872 0 0010 5.139zm0 1.389A3.462 3.462 0 0113.471 10a3.462 3.462 0 01-3.473 3.472A3.462 3.462 0 016.527 10 3.462 3.462 0 0110 6.528zM1.665 9.305v1.39h2.083v-1.39H1.666zm14.583 0v1.39h2.084v-1.39h-2.084zM5.09 13.928L3.616 15.4l.982.982 1.473-1.473-.982-.982zm9.82 0l-.982.982 1.473 1.473.982-.982-1.473-1.473zM9.305 16.25v2.083h1.389V16.25h-1.39z"/></svg>')`,
    },
    ...theme.applyStyles('dark', {
      backgroundColor: '#003892',
    }),
  },
  '& .MuiSwitch-track': {
    opacity: 1,
    backgroundColor: '#aab4be',
    borderRadius: 20 / 2,
    ...theme.applyStyles('dark', {
      backgroundColor: '#8796A5',
    }),
  },
}));

export const ConfigSection = styled(SettingsSection)(() => ({
  width: '100%',
  maxWidth: '472px',
}));

export const ThemeFormControl = styled(FormControl)(() => ({
  alignItems: 'start',
}));

export const ThemeFormControlLabel = styled(FormControlLabel)(() => ({
  marginLeft: 0,
}));
