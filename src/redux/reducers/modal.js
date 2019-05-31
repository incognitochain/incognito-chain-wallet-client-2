import type from '@src/redux/types/modal';
import { remove } from 'lodash';

const initialState = {
  opening: []
};

const addModal = (list, { id, ...modalData } = {}) => {
  return list.find(item => item?.id === id) ? list : [...list, { id, ...modalData }];
};

const removeModal = (list, id) => {
  const newList = [...list];

  if (list.find(item => item?.id === id)) {
    remove(newList, item => item?.id === id);
  }

  return newList;
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
  case type.OPEN:
    return {
      ...state,
      opening: addModal(state.opening, action.data)
    };
  case type.CLOSE:
    return {
      ...state,
      opening: removeModal(state.opening, action.data)
    };
  default:
    return state;
  }
};

export default reducer;