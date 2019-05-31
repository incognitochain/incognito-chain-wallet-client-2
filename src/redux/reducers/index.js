import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import wallet from './wallet';
import account from './account';
import token from './token';
import modal from './modal';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  account,
  token,
  wallet,
  modal,
  form: formReducer
});

export default createRootReducer;