import { makeStyles } from '@material-ui/core/styles';
import green from '@material-ui/core/colors/green';
import amber from '@material-ui/core/colors/amber';

const useStyles = makeStyles(theme => ({
  close: {
    padding: theme.spacing(0.5),
  },
  success: {
    backgroundColor: green[600],
  },
  error: {
    backgroundColor: theme.palette.error.dark,
  },
  info: {
    backgroundColor: theme.palette.primary.dark,
  },
  warning: {
    backgroundColor: amber[700],
  },
  message: {
    display: 'flex',
    alignItems: 'center',
  },
}));

export default useStyles;