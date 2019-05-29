import { genNamspace } from '@src/utils/reduxUtils';

const n = genNamspace('ACCOUNT');

// define types here
const TYPES = {
  SET: n('SET'),
  SET_BULK: n('SET_BULK'),
  REMOVE_BY_NAME: n('REMOVE_BY_NAME'),
  GET_BALANCE: n('GET_BALANCE'),
  GET_BALANCE_FINISH: n('GET_BALANCE_FINISH'),
  SET_DEFAULT_ACCOUNT: n('SET_DEFAULT_ACCOUNT')
};

export default TYPES;