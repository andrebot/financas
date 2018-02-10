import React from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import RaisedButton from 'material-ui/RaisedButton';
import { render } from 'react-dom';
import mainCss from './main.styl';

const App = () => (
  <div>
    <h1>Ola, porra</h1>
    <RaisedButton label="opa"/>
  </div>
)

render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
  , document.getElementById('container')
);
