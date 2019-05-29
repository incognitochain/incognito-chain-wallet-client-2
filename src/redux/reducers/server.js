import type from '@src/redux/types/server';
import _ from 'lodash';

const initialState = {
  list: [],
  defaultServer: null
};

const getDefaultServer = list => list.find(_item => _item.default) || list[0];

const setBulk = (list, servers) => {
  let newList = [...list];
  try {
    newList = _.unionBy(servers, list, 'id');
  } catch(e) {
    console.error(e);
  }
  return newList;
};


const reducer = (state = initialState, action) => {
  let newList;

  switch (action.type) {
  case type.SET_DEFAULT:
    return {
      ...state,
      defaultServer: action.data
    };
  case type.SET_BULK:
    newList = setBulk(state.list, action.data);
    return {
      ...state,
      list: newList,
      defaultServer: getDefaultServer(newList)
    };

  default:
    return state;
  }
};

export default reducer;