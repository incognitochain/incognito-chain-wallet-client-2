import type from '@src/redux/types/sample';

const reducer = (state = 0, action) => {
  switch (action.type) {
  case type.ACTION_1:
    return state + action.data;
  case type.ACTION_2:
    return state - action.data;
  default:
    return state;
  }
};

export default reducer;