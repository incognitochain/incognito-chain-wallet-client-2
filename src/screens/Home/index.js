import React, { Component } from 'react';
import { connect } from 'react-redux';
import accountService from '@src/services/wallet/Account';
import { TOKEN_DATA } from '@src/constants';
import { openSnackbar } from '@src/components/core/Snackbar';
import Home from './Home';

class HomeContainer extends Component {
  constructor() {
    super();

    this.state = {
      tokens: []
    };
  }

  async componentDidMount() {
    this.getFollowingToken();

    // tokenService.getPrivacyTokens().then(console.log);

    // const { wallet, account } = this.props;

    // const indexAccount = wallet.getAccountIndexByName(account.name);
    // const accountWallet = wallet.MasterAccount.child[
    //   indexAccount
    // ];

    // console.log(await accountWallet.getPrivacyCustomTokenBalance('ffd8d42dc40a8d166ea4848baf8b5f6e912ad79875f4373070b59392b1756c8f'));
  }

  getAccountData = account => ({
    name: TOKEN_DATA.NAME.PRV,
    amount: account
  })

  getFollowingToken = async () => {
    try {
      const { account, wallet } = this.props;
      const tokens = await accountService.getFollowingTokens(account, wallet);

      this.setState({ tokens });
    } catch {
      openSnackbar({ message: 'Can not get list token for this account', type: 'error' });
    }
  }

  render() {
    const { tokens } = this.state;
    const { account } = this.props;
    return (
      <Home account={account} tokens={tokens} />
    );
  }
}

const mapState = state => ({
  account: state.account.defaultAccount,
  wallet: state.wallet
});

export default connect(mapState)(HomeContainer);