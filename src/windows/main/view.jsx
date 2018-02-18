import React from 'react';
import { render } from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Tabs, Tab } from 'material-ui/Tabs';
import mainCss from './main.styl';

const App = () => (
  <div>
    <Tabs>
      <Tab label="Summary">
        Oi
      </Tab>
      <Tab label="Details">
        Ola
      </Tab>
    </Tabs>
  </div>
)

render(
  <MuiThemeProvider>
    <App />
  </MuiThemeProvider>
  , document.getElementById('container')
);
