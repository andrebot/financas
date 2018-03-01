import React from 'react';
import { render } from 'react-dom';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Tabs, Tab } from 'material-ui/Tabs';
import SummaryTab from './summaryTab/summaryTab.jsx';
import mainStyle from './mainStyle.jsx';

const App = () => (
  <div>
    <Tabs>
      <Tab label="Summary">
        <div style={mainStyle.flexContainer}>
          <div style={mainStyle.flexDefault}>
            <SummaryTab />
          </div>
        </div>
      </Tab>
      <Tab label="Details">
        Ol
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
