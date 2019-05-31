import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import accountService from '@src/services/wallet/Account';
import { openSnackbar } from '@src/components/core/Snackbar';
import { setBulkToken, getBalance, setDefaultToken } from '@src/redux/actions/token';
import { getBalance as getAccountBalance } from '@src/redux/actions/account';
import { openModal } from '@src/redux/actions/modal';
import Home from './Home';

class HomeContainer extends Component {
  componentDidMount() {
    const { account } = this.props;
    this.getFollowingToken();
    this.getAccountBalance(account);
  }

  getTokenBalance = token => {
    const { getBalance } = this.props;
    getBalance(token);
  }

  getAccountBalance = account => {
    const { getAccountBalance } = this.props;
    getAccountBalance(account);
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

  handleSelectToken = (token) => {
    if (!token) return;

    const { setDefaultToken, openModal } = this.props;
    setDefaultToken(token);
    openModal({
      component: () => `Open ${token.symbol} detail`,
      title: token.name
    });
  }

  render() {
    const { account, tokens, isGettingBalanceList, openModal } = this.props;
    return (
      <Home
        account={account}
        tokens={tokens}
        isGettingBalanceList={isGettingBalanceList}
        onSelectToken={this.handleSelectToken}
        openModal={openModal}
      />
    );
  }
}

const mapState = state => ({
  account: state.account.defaultAccount,
  wallet: state.wallet,
  tokens: state.token.followed || [],
  isGettingBalanceList: [...state.account.isGettingBalance, ...state.token.isGettingBalance]
});

const mapDispatch = { setBulkToken, getBalance, getAccountBalance, setDefaultToken, openModal };

HomeContainer.propTypes = {
  isGettingBalanceList: PropTypes.array,
  tokens: PropTypes.array,
  account: PropTypes.object,
  wallet: PropTypes.object,
  setBulkToken: PropTypes.func.isRequired,
  getBalance: PropTypes.func.isRequired,
  getAccountBalance: PropTypes.func.isRequired,
  setDefaultToken: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
};

export default connect(mapState, mapDispatch)(HomeContainer);