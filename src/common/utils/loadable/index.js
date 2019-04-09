import React from "react";
import LoadableVisibility from "react-loadable-visibility/react-loadable";
import { List } from "react-content-loader";
import { LoadingIcon, Error, FadeIn, LoadingPage } from "./styled";

const Loading = props => {
  if (props.error) {
    return (
      <Error>
        Can not display
        <button type="button" onClick={props.retry}>
          <LoadingIcon size={20} />
          Retry
        </button>
      </Error>
    );
  } else if (props.pastDelay) {
    return (
      <LoadingPage>
        <List />
      </LoadingPage>
    );
  } else {
    return null;
  }
};

const loadable = config => {
  let options = {
    loading: Loading,
    delay: 0,
    render(loaded, props) {
      let Component = loaded.default;
      return (
        <FadeIn>
          <Component {...props} />
        </FadeIn>
      );
    }
  };
  if (typeof config === "function") {
    options.loader = config;
  } else if (typeof config === "object") {
    options = {
      ...options,
      ...config
    };
  }

  return LoadableVisibility(options);
};

export default loadable;
