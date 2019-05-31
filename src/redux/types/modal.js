import { genNamspace } from '@src/utils/reduxUtils';

const n = genNamspace('MODAL');

// define types here
const TYPES = {
  OPEN: n('OPEN'),
  CLOSE: n('CLOSE'),
};

export default TYPES;