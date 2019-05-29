import { createMuiTheme } from '@material-ui/core/styles';
import colors from './color';
import fonts from './font';

const defaultFont = fonts.robotoMono;

export default createMuiTheme({
  defaultFont,
  colors,
  fonts,
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