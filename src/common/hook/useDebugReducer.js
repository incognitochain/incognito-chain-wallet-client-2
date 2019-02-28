import React from "react";

/**
 * Use just as the same as React.useReducer, but state and action is be logged to the console.
 * @param  {...any} params The same params passed to React.useReducer()
 */
export function useDebugReducer(...params) {
  const [state, originDispatch] = React.useReducer(...params);

  const dispatch = action => {
    originDispatch(action);
    process.env.NODE_ENV === "development" &&
      console.log("dispatched:", action);
  };
  console.log("\tstate", state);

  return [state, dispatch];
}
