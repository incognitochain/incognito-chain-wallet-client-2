import React from 'react';
import { ThemeProvider } from '@material-ui/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import routes, { RenderRoutes } from '@src/router';
import Snackbar from '@src/components/core/Snackbar';
import ModalProvider from '@src/components/Modal';
import '@src/assets/scss/main.scss';
import theme from '@src/styles/theme';

const App = () => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <RenderRoutes routes={routes} />
    <Snackbar />
    <ModalProvider />
  </ThemeProvider>
);

export default App;
