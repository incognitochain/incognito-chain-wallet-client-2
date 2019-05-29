import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Container from '@src/components/Container';
import routeName from './routeName';

/**
 * Mock func
 */
const isAuth = () => {
  // TODO
  return true;
};

const PrivateRoute = ({ component: Component, routes, path, noContainer, componentProps, containerProps, walletRequired, isLoadedWallet, ...rest }) => (
  <Route
    {...rest}
    path={path}
    render={props => {
      if (walletRequired && !isLoadedWallet) {
        return (
          <Redirect
            to={{
              pathname: routeName.Splash,
              state: {from: props.location}
            }}
          />
        );
      }

      if (!isAuth()) {
        return (
          <Redirect
            to={{
              pathname: routeName.Login,
              state: {from: props.location}
            }}
          />
        );
      }
      

      // pass the sub-routes down to keep nesting
      const COM = <Component {...props} {...componentProps} routes={routes} />;
      return <Container {...containerProps}>{COM}</Container>;
    }}
  />
);

export default PrivateRoute;
