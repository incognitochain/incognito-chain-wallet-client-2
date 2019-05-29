module.exports = ({ ctx }) => {
  return ({
    plugins: {
      precss: {},
      autoprefixer: {
        ...ctx ? ctx.options.autoprefixer : {},
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9',
        ],
      },
    },
  });
};
