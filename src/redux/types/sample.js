import { genNamspace } from '@src/utils/reduxUtils';

const n = genNamspace('SAMPLE');

// define types here
const TYPES = {
  ACTION_1: n('ACTION_1'), // output: SAMPLE/ACTION_1
  ACTION_2: n('ACTION_2')  // output: SAMPLE/ACTION_2
};

export default TYPES;