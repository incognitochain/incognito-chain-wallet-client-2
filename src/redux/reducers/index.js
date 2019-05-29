import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { connectRouter } from 'connected-react-router';
import wallet from './wallet';
import account from './account';

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  account,
  wallet,
  form: formReducer
});

export default createRootReducer;