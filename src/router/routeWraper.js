import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import Container from '@src/components/Container';
import routeName from './routeName';

// wrap <Route> and use this everywhere instead, then when
// sub routes are added to any route it'll work
function RouteWithSubRoutes({ component: Component, routes, path, componentProps, containerProps, walletRequired, isLoadedWallet, ...rest }) {
  return (
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

        // pass the sub-routes down to keep nesting
        const COM = <Component {...props} {...componentProps} routes={routes} />;
        return <Container {...containerProps}>{COM}</Container>;
      }}
    />
  );
}

export default RouteWithSubRoutes;
