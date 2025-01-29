import { styled } from '@mui/material/styles';
import bgImage from '../../assets/loginSplash.jpg';
import { StyleCompProp } from '../../types';
import { Button, TextField, Link } from '@mui/material';

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
}));

const LoginImageContainer = styled('div')(({ theme }: StyleCompProp) => ({
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
}));

const LoginFormContainer = styled('div')(({ theme }: StyleCompProp) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  flexGrow: 1,
  padding: '40px',
}))

const LoginButton = styled(Button)(({ theme }: StyleCompProp) => ({
  width: '100%',
}));

const LoginTextField = styled(TextField)(({ theme }: StyleCompProp) => ({
  width: '100%',
}));

const ForgotLink = styled(Link)(({ theme }: StyleCompProp) => ({
  cursor: 'pointer',
}));

export {
  LoginMainDiv,
  LoginContainer,
  LoginStyledWrapper,
  LoginImageContainer,
  LoginImage,
  LoginFormContainer,
  LoginButton,
  LoginTextField,
  ForgotLink,
};
