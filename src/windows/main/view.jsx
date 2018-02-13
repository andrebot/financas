import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { render } from 'react-dom';
import MainMenu from '../components/mainMenu/mainMenu.jsx';
import mainCss from './main.styl';

const App = () => (
  <div>
    <MainMenu />
  </div>
)

render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
  , document.getElementById('container')
);
