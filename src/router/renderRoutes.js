import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';
import NotFoundPage from '@src/screens/NotFound';
import Container from '@src/components/Container';
import RouteWrapper from './routeWraper';
import PrivateRoute from './privateRoute';


const RenderRoute = ({ routes = [], isLoadedWallet }) => (
  <Switch>
    { routes && routes.map((route, index) => {
      const { auth, walletRequired = true } = route;
      const Component = auth ? PrivateRoute : RouteWrapper;
      return <Component key={`${route.path}-${index}`} {...route} walletRequired={walletRequired} isLoadedWallet={isLoadedWallet} />;
    })}
    <Route render={props => {
      return (
        <Container><NotFoundPage {...props} /></Container>
      );
    }}
    />
  </Switch>
);

const mapState = state => ({
  isLoadedWallet: !!state.wallet?.Name
});

export default connect(mapState)(RenderRoute);