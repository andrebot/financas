import React from 'react';
import { render } from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

const App = () => (
  <div>
    OLHA AI
  </div>
)

render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
  , document.getElementById('container')
);
