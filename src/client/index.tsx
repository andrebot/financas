import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

import App from './app';
import { store } from './features/store';

const rootElement = document.getElementById('app');
const root = rootElement ? createRoot(rootElement) : null;

if (root) {
  root.render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
}
