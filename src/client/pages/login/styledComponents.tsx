import { styled } from '@mui/material/styles';
import bgImage from '../../assets/loginSplash.jpg';
import { StyleCompProp } from '../../types';
import { Button, TextField, Link } from '@mui/material';
import PasswordField from '../../components/form/passwordField';

const LoginMainDiv = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  backgroundColor: theme.palette.background.default,
}));

const LoginContainer = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'row',
  backgroundColor: theme.palette.primary.contrastText,
  borderRadius: '10px',
  boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)',
  width: '50%',
  height: '60%',
  [theme.breakpoints.between('xs', 'md')]: {
    width: '100%',
    height: '100%',
  },
  [theme.breakpoints.between('md', 'lg')]: {
    width: '80%',
    height: '80%',
  },
  [theme.breakpoints.down('sm')]: {
    backgroundImage: `url(${bgImage})`,
    backgroundSize: 'cover',
  },
}));

const LoginStyledWrapper = styled('div')(({ theme }: StyleCompProp) => ({
  backgroundImage: `url(${bgImage})`,
  backgroundSize: 'cover',
  height: '100%',
  width: '50%',
  borderTopLeftRadius: '10px',
  borderBottomLeftRadius: '10px',
  display: 'grid',
  gridTemplateColumns: '2fr 3fr',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
}));

const LoginImageContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
}));

const LoginImage = styled('img')(({ theme }: StyleCompProp) => ({
  width: '80%',
  height: '30%',
  flexGrow: 0,
  borderRadius: '10px',
  [theme.breakpoints.down('sm')]: {
    display: 'none',
  },
  [theme.breakpoints.up('lg')]: {
    width: '115px',
    height: '110px',
  },
}));

const LoginFormContainer = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  flexGrow: 1,
  padding: '40px',
}))

const LoginButton = styled(Button)(() => ({
  width: '100%',
}));

const LoginTextField = styled(TextField)(() => ({
  width: '100%',
}));

const LoginPasswordField = styled(PasswordField)(() => ({
  width: '100%',
}));

const ForgotLink = styled(Link)(() => ({
  cursor: 'pointer',
}));

export {
  LoginImageContainer,
  LoginStyledWrapper,
  LoginPasswordField,
  LoginFormContainer,
  LoginContainer,
  LoginTextField,
  LoginMainDiv,
  LoginButton,
  LoginImage,
  ForgotLink,
};
