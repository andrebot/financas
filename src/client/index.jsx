import React from 'react';
import { combineReducers, createStore, applyMiddleware } from 'redux';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';
import thunk from 'redux-thunk';
import MainMenu from './components/menu/menu.container.jsx';
import DetailsPageComp from './pages/detailsPage/detailsPage.container.jsx';
import menu from './components/menu/reducer.jsx';
import detailsPage from './components/detailsPage/reducer.jsx';

const app = combineReducers({
  menu,
  detailsPage
});
const store = createStore(app, applyMiddleware(thunk));

render(
  <Provider store={store}>
    <BrowserRouter>
      <div>
        <Route path='/' render={props => <MainMenu {...props} />} />
        <Route path='/details' exact render={props => <DetailsPageComp />} />
      </div>
    </BrowserRouter>
  </Provider>
  , document.getElementById('container')
);
