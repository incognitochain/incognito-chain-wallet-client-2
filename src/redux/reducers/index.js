import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import wallet from './wallet';
import account from './account';

const rootReducer = combineReducers({
  account,
  wallet,
  form: formReducer
});

export default rootReducer;