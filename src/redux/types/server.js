import { genNamspace } from '@src/utils/reduxUtils';

const n = genNamspace('SERVER');

// define types here
const TYPES = {
  SET_DEFAULT: n('SET_DEFAULT'),
  SET_BULK: n('SET_BULK')
};

export default TYPES;