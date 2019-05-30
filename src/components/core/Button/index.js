import { Button as MdButton } from '@material-ui/core';
import { styled } from '@material-ui/styles';

export default styled(MdButton)(({ theme: { decors, colors, fonts, spacing } }) => ({
  backgroundColor: colors.green,
  borderRadius: decors.borderRadius,
  fontFamily: fonts.ubuntuMono,
  fontWeight: 300,
  fontSize: 18,
  color: '#131413',
  letterSpacing: 0,
  textTransform: 'unset',
  padding: spacing(1, 2),
  '&:hover': {
    backgroundColor: colors.green,
  }
}));