import privacyIcon from '@src/assets/image/icon/icons-privacy.webp';
import btcIcon from '@src/assets/image/icon/icons-btc.webp';
import ethIcon from '@src/assets/image/icon/icons-eth.webp';

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
    name: 'pETH',
    icon: ethIcon
  },
  [NAME.pBTC]: {
    fullName: 'Private BTC',
    typeName: 'Bitcoin',
    symbol: 'pBTC',
    name: 'pBTC',
    icon: btcIcon
  },
  [NAME.PRV]: {
    fullName: 'Privacy',
    typeName: 'Incognito',
    symbol: 'PRV',
    name: 'PRV',
    icon: privacyIcon
  }
};

export default {
  DATA, NAME
};