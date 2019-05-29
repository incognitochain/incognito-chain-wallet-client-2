import type from '@src/redux/types/server';

export const setDefaultServer = (server = throw new Error('Server object is required')) => ({
  type: type.SET_DEFAULT,
  data: server
});

export const setBulkServer = (servers = throw new Error('Server array is required')) => {
  if (servers && servers.constructor !== Array) {
    throw new TypeError('Servers must be an array');
  }

  return ({
    type: type.SET_BULK,
    data: servers
  });
};