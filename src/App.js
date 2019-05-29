import React from 'react';
import routes, { RenderRoutes } from '@src/router';
import Snackbar from '@src/components/core/Snackbar';

const App = () => (
  <>
    <RenderRoutes routes={routes} />
    <Snackbar />
  </>
);

export default App;
