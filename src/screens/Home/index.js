import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import accountService from '@src/services/wallet/Account';
import { openSnackbar } from '@src/components/core/Snackbar';
import { setBulkToken, getBalance } from '@src/redux/actions/token';
import Home from './Home';

class HomeContainer extends Component {
  componentDidMount() {
    this.getFollowingToken();
  }

  getTokenBalance = token => {
    const { getBalance } = this.props;
    getBalance(token);
  }

  getFollowingToken = async () => {
    try {
      const { account, wallet, setBulkToken } = this.props;
      const tokens = await accountService.getFollowingTokens(account, wallet);
      tokens.forEach(this.getTokenBalance);
      setBulkToken(tokens);
    } catch {
      openSnackbar({ message: 'Can not get list token for this account', type: 'error' });
    }
  }

  render() {
    const { account, tokens } = this.props;
    return (
      <Home account={account} tokens={tokens} />
    );
  }
}

const mapState = state => ({
  account: state.account.defaultAccount,
  wallet: state.wallet,
  tokens: state.token.followed || []
});

const mapDispatch = { setBulkToken, getBalance };

HomeContainer.propTypes = {
  tokens: PropTypes.array,
  account: PropTypes.object,
  wallet: PropTypes.object,
  setBulkToken: PropTypes.func.isRequired,
  getBalance: PropTypes.func.isRequired,
};

export default connect(mapState, mapDispatch)(HomeContainer);