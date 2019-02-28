import { useEffect, useMemo, useReducer, useState } from "react";

const toStorage = value => JSON.stringify(value);

const fromStorage = value => (value !== null ? JSON.parse(value) : null);

const readItem = (storage, key) => {
  try {
    const storedValue = storage.getItem(key);
    return fromStorage(storedValue);
  } catch (e) {
    return null;
  }
};

const writeItem = (storage, key, value) =>
  new Promise((resolve, reject) => {
    try {
      storage.setItem(key, toStorage(value));
      resolve();
    } catch (error) {
      reject(error);
    }
  });

const useStorageListener = (key, onChange) => {
  const handleStorageChange = event => {
    if (event.key === key) {
      onChange(fromStorage(event.newValue));
    }
  };

  useEffect(() => {
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);
};

const useStorageWriter = (storage, key, state: S) => {
  const [writeError, setWriteError] = useState(undefined);

  useEffect(() => {
    writeItem(storage, key, state).catch(setWriteError);
  }, [state]);
  useEffect(() => {
    setWriteError(undefined);
  }, [key]);

  return writeError;
};

const isObject = value =>
  value !== null && typeof value === "object" && !Array.isArray(value);

const INTERNAL_SET_STATE_ACTION_TYPE = Symbol("INTERNAL_SET_STATE_ACTION_TYPE");

export const useLocalStorageReducer = (
  key,
  reducer,
  defaultState,
  initialAction
) => {
  const storageReducer = (prevState, action) => {
    if (
      !initialAction &&
      isObject(action) &&
      action.type === INTERNAL_SET_STATE_ACTION_TYPE
    ) {
      return action.payload;
    }

    return reducer(prevState, action);
  };
  const initialState = useMemo(() => {
    const savedState = readItem(window.localStorage, key);
    return savedState !== null ? savedState : defaultState;
  }, [key]);
  const [state, dispatch] = useReducer(
    storageReducer,
    initialState,
    initialAction
  );
  const writeError = useStorageWriter(window.localStorage, key, state);
  useStorageListener(key, newValue => {
    dispatch({ type: INTERNAL_SET_STATE_ACTION_TYPE, payload: newValue });
  });

  useEffect(() => {
    dispatch({ type: INTERNAL_SET_STATE_ACTION_TYPE, payload: initialState });
  }, [key]);

  return [state, dispatch, writeError];
};

const isFunction = fn => typeof fn === "function";

export const useLocalStorageState = (key, defaultState) => {
  const getInitialState = () => {
    const savedState = readItem(window.localStorage, key);
    if (savedState !== null) {
      return savedState;
    }
    return isFunction(defaultState) ? defaultState() : defaultState;
  };

  const [state, setState] = useState(getInitialState);
  const writeError = useStorageWriter(window.localStorage, key, state);
  useStorageListener(key, setState);

  useEffect(() => {
    setState(getInitialState());
  }, [key]);

  return [state, setState, writeError];
};
