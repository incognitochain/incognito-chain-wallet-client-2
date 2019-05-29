const { API_BASE_URL, PASSWORD_SECRET_KEY, SHARD_ID, EXPLORER_CONSTANT_CHAIN_URL, DEFAULT_PASSPHRASE } = APP_ENV;

const DEFAULT_LIST_SERVER = [{
  id: 'local',
  default: false,
  address: 'http://localhost:9334',
  username: '',
  password: '',
  name: 'Local'
},
{
  id: 'testnet',
  default: true,
  address: 'https://test-node.incognito.org',
  username: '',
  password: '',
  name: 'Testnet'
}];

export default {
  API_BASE_URL,
  PASSWORD_SECRET_KEY,
  SHARD_ID,
  EXPLORER_CONSTANT_CHAIN_URL,
  DEFAULT_LIST_SERVER,
  DEFAULT_PASSPHRASE
};