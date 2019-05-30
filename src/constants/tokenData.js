const NAME = {
  pETH: 'pETH',
  pBTC: 'pBTC',
  PRV: 'PRV'
};

const DATA = {
  [NAME.pETH]: {
    fullName: 'Private ETH',
    typeName: 'Ethereum',
    symbol: 'pETH',
    icon: null
  },
  [NAME.pBTC]: {
    fullName: 'Private BTC',
    typeName: 'Bitcoin',
    symbol: 'pBTC',
    icon: null
  },
  [NAME.PRV]: {
    fullName: 'Privacy',
    typeName: 'Incognito',
    symbol: 'PRV',
    icon: null
  }
};

export default {
  DATA, NAME
};