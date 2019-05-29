import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { createBrowserHistory } from 'history';
import { routerMiddleware } from 'connected-react-router';
import createRootReducer from '@src/redux/reducers';

export const history = createBrowserHistory();

export default function configureStore(preloadedState) {
  const middlewares = [thunkMiddleware, routerMiddleware(history)];
  const middlewareEnhancer = applyMiddleware(...middlewares);

  const enhancers = [middlewareEnhancer];
  const composedEnhancers = composeWithDevTools(...enhancers);
  const rootReducer = createRootReducer(history);

  const store = createStore(rootReducer, preloadedState, composedEnhancers);

  if (!APP_ENV.production && module.hot) {
    module.hot.accept('@src/redux/reducers', () => store.replaceReducer(rootReducer));
  }

  return store;
}