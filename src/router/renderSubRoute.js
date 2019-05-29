import React from 'react';
import RouteWrapper from './routeWraper';
import PrivateRoute from './privateRoute';

export default (routes = []) => {
  return routes.map((route, index) => {
    const Component = route.auth ? PrivateRoute : RouteWrapper;
    return <Component containerProps={{ noContainer: true }} key={`${route.path}-${index}`} {...route} />;
  });
};

/** H0W TO USE */
/**
 * src/routes/index.js
 * {
 *   ...older routes here
 *   {
 *      path: '/parent',
 *      component: Parent,
 *      routes: [
 *        {
 *           path: '/parent/child1',
 *           component: Child1,
 *           exact: true
 *        },
 *        {
 *           path: '/parent/child2',
 *           component: Child2,
 *           exact: true
 *        }
 *     ]
 *   }
 * }
 */

/**
  * src/component/parent.jsx
  * 
  * import renderSubRoute from 'src/routes/renderSubRoute';
  * 
  * render() {
  *   return (
  *     <div>
  *        Parent layout
  *        {renderSubRoute(this.props.routes)} <=== put here
  *     </div>
  *   );
  * }
  */