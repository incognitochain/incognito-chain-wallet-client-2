export const navigationOptionsHandler = screen => {
  const _screen = screen;
  _screen.navigationOptions = {
    ...screen.navigationOptions,
    headerLeft: undefined
  };

  return _screen;
};