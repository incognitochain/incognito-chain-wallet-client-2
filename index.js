import React from 'react';
import ReactDom from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import App from '@src/App';
import { Provider } from 'react-redux';
import configureStore from '@src/redux/store';

const store = configureStore();
const container = document.getElementById('root-app');
const render = COM => ReactDom.render(
  <Router>
    <Provider store={store}>
      <COM />
    </Provider>
  </Router>, container
);

render(App);

if (module.hot) {
  module.hot.accept('@src/App', () => {
    render(App);
  });
}