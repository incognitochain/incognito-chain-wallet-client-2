import React from "react";

/**
 * Use just as the same as React.useReducer, but state and action is be logged to the console.
 * @param  {...any} params The same params passed to React.useReducer()
 */
export function useDebugReducer(name, ...params) {
  const [state, originDispatch] = React.useReducer(...params);

  const dispatch = action => {
    originDispatch(action);
    console.log(name + " dispatched:", action);
  };

  console.log(`\t ${name} state`, state);

  return [state, dispatch];
}
