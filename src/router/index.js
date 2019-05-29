import Loadable from 'react-loadable';
import Loading from '@src/components/LoadingPage';
import privateRoute from './privateRoute';
import renderRoutes from './renderRoutes';
import routeWrapper from './routeWraper';
import routeName from './routeName';

const AsyncHome = Loadable({
  loader: () => import('@src/screens/Home'),
  loading: Loading
});

const AsyncSplash = Loadable({
  loader: () => import('@src/screens/Splash'),
  loading: Loading
});

/**
 * {
    path: '/some-path',
    component: YourComponent,
    componentProps: { name: 'Component Name' },
    auth: bool ==> need to auth to see this view
    walletRequired: bool => required wallet object was created | default true
    containerProps: { header: true [,headerProps] , footer: true [,footerProps], bodyWrapper: true, noContainer: false }; noContainer = true to render children without container
    ...react-router props
  },
 */
const routes = [
  {
    path: routeName.Splash,
    component: AsyncSplash,
    exact: true,
    walletRequired: false
  },
  {
    path: routeName.Home,
    component: AsyncHome,
    exact: true,
    auth: true
  },
];


export default routes;
export const RouteWrapper = routeWrapper;
export const RenderRoutes = renderRoutes;
export const PrivateRoute = privateRoute;
