import type from '@src/redux/types/account';
import { unionBy, remove } from 'lodash';

const initialState = {
  list: [],
  defaultAccount: null,
  isGettingBalance: []
};

const setAccount = (list, account) => {
  let newList = [...list];
  try {
    newList = unionBy([account], list, 'name');
  } catch(e) {
    console.error(e);
  }
  return newList;
};

const updateDefaultAccountInList = (list, defaultAccount) => {
  let newList = list.map(_account => {
    if (defaultAccount.name === _account.default) {
      return defaultAccount;
    }

    return {
      ..._account,
      default: false
    };
  });
  
  try {
    newList = unionBy([defaultAccount], list, 'name');
  } catch(e) {
    console.error(e);
  }
  return newList;
};

const setBulkAccount = (list, accounts) => {
  let newList = [...list];
  try {
    newList = unionBy(accounts, list, 'name');
  } catch(e) {
    console.error(e);
  }
  return newList;
};

const removeByName = (list, accountName) => {
  const newList = [...list];
  try {
    remove(newList, _item => _item.name === accountName);
  } catch(e) {
    console.error(e);
  }
  return newList;
};

const getDefaultAccount = list => list.find(_item => _item.default) || list[0];

const setGettingBalance = (list, accountName) => {
  const newList = [...list];
  return newList.includes(accountName) ? newList : [...newList, accountName];
};

const removeGettingBalance = (list, accountName) => {
  const newList = [...list];
  remove(newList, item => item === accountName);
  return newList;
};

const reducer = (state = initialState, action) => {
  let newList = [];

  switch (action.type) {
  case type.SET:
    newList = setAccount(state.list, action.data);
    return {
      ...state,
      list: newList,
      defaultAccount: getDefaultAccount(newList)
    };
  case type.SET_BULK:
    newList = setBulkAccount(state.list, action.data);
    return {
      ...state,
      list: newList,
      defaultAccount: getDefaultAccount(newList)
    };
  case type.REMOVE_BY_NAME:
    newList = removeByName(state.list, action.data);
    return {
      ...state,
      list: newList,
      defaultAccount: getDefaultAccount(newList)
    };
  case type.GET_BALANCE: 
    return {
      ...state,
      isGettingBalance: setGettingBalance(state.isGettingBalance, action.data)
    };
  case type.GET_BALANCE_FINISH: 
    return {
      ...state,
      isGettingBalance: removeGettingBalance(state.isGettingBalance, action.data)
    };
  case type.SET_DEFAULT_ACCOUNT:
    return {
      ...state,
      list: updateDefaultAccountInList(state.list, action.data),
      defaultAccount: action.data
    };
  default:
    return state;
  }
};

export default reducer;