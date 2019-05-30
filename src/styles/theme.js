import { createMuiTheme } from '@material-ui/core/styles';
import colors from './color';
import fonts from './font';
import decors from './decor';

const defaultFont = fonts.robotoMono;

export default createMuiTheme({
  defaultFont,
  colors,
  fonts,
  decors,
  palette: {
    type: 'dark',
    background: {
      default: colors.grey2
    },
    text: {
      primary: colors.white,
      secondary: colors.grey,
    }
  },
  typography: {
    fontSize: 16,
    fontFamily: [
      defaultFont
    ].join(','),
  },
  spacing: 15
});