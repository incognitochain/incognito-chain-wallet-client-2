import React from "react";

/**
 * Use just as the same as React.useReducer, but state and action are logged to the console.
 * Example usage:
 * ```
 *   const [state, dispatch] = useDebugReducer('MyComponent', reducer, initialState)
 *   // Console:
 *   // MyComponent dispatch: {...}
 *   // \t MyComponent state: {...}
 * ```
 * or
 * ```
 *   const [state, dispatch] = useDebugReducer(reducer, initialState)
 *   // log nothing
 * ```
 * @param {string} name - A name to identify between each useDebugReducer call, can be ignored
 */
export function useDebugReducer(name, ...params) {
  if (typeof name === "function") {
    return React.useReducer(name, ...params);
  } else {
    const [state, originDispatch] = React.useReducer(...params);

    const dispatch = action => {
      originDispatch(action);
      console.log(name + " dispatched:", action);
    };

    console.log(`\t ${name} state`, state);

    return [state, dispatch];
  }
}
