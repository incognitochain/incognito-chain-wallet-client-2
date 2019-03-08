import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "@material-ui/core";
import TokenList from "./TokenList";
import { Button } from "@material-ui/core";

import "./TokenTabs.scss";
import styled from "styled-components";
import { FollowTokenDialog } from "../../modules/tokens/FollowTokenDialog";
import { connectWalletContext } from "../../common/context/WalletContext";
import { connectAccountContext } from "../../common/context/AccountContext";
import _ from "lodash";
import { TokenHistoryDialog } from "../../modules/tokens/TokenHistoryDialog";

const mapTabNameToIndex = {
  privacy: 0,
  custom: 1
};

const mapTabIndexToName = Object.entries(mapTabNameToIndex).reduce(
  (acc, [tabName, tabIndex]) => ({
    ...acc,
    [tabIndex]: tabName
  }),
  {}
);

class TokenTabs extends React.Component {
  static propTypes = {
    paymentAddress: PropTypes.string.isRequired,
    privateKey: PropTypes.string.isRequired
  };
  constructor(props) {
    super(props);
    this.state = {
      showAlert: "",
      value: mapTabNameToIndex["privacy"],
      listCustomTokenBalance: [],
      listPrivacyTokenBalance: []
    };
  }
  componentDidMount() {
    this.onRefresh();
  }
  componentDidUpdate(prevProps) {
    if (this.props.account.name !== prevProps.account.name) {
      this.onRefresh();
    }
  }

  onRefresh = () => {
    try {
      const { wallet, account } = this.props;
      const accountWallet = wallet.getAccountByName(account.name);
      const followingTokens = accountWallet.listFollowingTokens();

      this.setState({
        listCustomTokenBalance: followingTokens.filter(
          token => token.type === "custom"
        ),
        listPrivacyTokenBalance: followingTokens.filter(
          token => token.type === "privacy"
        )
      });
    } catch (e) {
      console.error("CAN NOT GET LIST OF FOLLOWING TOKENS");
    }
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };

  handleCreateToken = () => {
    const { value } = this.state;
    this.props.onCreateToken(value);
  };
  handleAddFollowingToken = () => {
    this.setState({ isOpenSearchTokenDialog: true });
  };
  handleUnfollow = ({ ID }) => {
    const { wallet, account } = this.props;
    const accountWallet = wallet.getAccountByName(account.name);
    accountWallet.removeFollowingToken(ID);
    this.onRefresh();
  };

  renderTabs() {
    const {
      value,
      listCustomTokenBalance,
      listPrivacyTokenBalance
    } = this.state;
    const props = {
      list: value === 0 ? listPrivacyTokenBalance : listCustomTokenBalance,
      tab: value, // depricated
      tabName: mapTabIndexToName[value],
      handleUnfollow: this.handleUnfollow,
      ...this.props
    };

    return (
      <>
        <Tabs
          value={value}
          indicatorColor="primary"
          variant="fullWidth"
          onChange={this.handleChange}
          className="tokenTabs"
        >
          <Tab label="Privacy" />
          <Tab label="Custom" />
        </Tabs>
        <TokenList {...props} />
      </>
    );
  }
  render() {
    return (
      <Wrapper className="TokenTabs">
        {this.renderTabs()}

        <ButtonWrapper>
          <Button
            variant="contained"
            size="medium"
            className="newTokenButton"
            onClick={this.handleCreateToken}
          >
            Create New Token
          </Button>

          <Button
            variant="contained"
            size="medium"
            className="newTokenButton"
            onClick={this.handleAddFollowingToken}
          >
            Add Tokens To Follow
          </Button>

          <Button
            variant="contained"
            size="medium"
            className="newTokenButton"
            onClick={() => this.setState({ isOpenTokenHistory: true })}
          >
            Show Token History
          </Button>
        </ButtonWrapper>

        <FollowTokenDialog
          isOpen={this.state.isOpenSearchTokenDialog}
          onClose={() => this.setState({ isOpenSearchTokenDialog: false })}
          tabName={mapTabIndexToName[this.state.value]}
          refreshTokenList={this.onRefresh}
          followedTokens={
            this.state.value === 0
              ? this.state.listPrivacyTokenBalance
              : this.state.listCustomTokenBalance
          }
        />

        <TokenHistoryDialog
          tabName={mapTabIndexToName[this.state.value]}
          isOpen={this.state.isOpenTokenHistory}
          onClose={() => this.setState({ isOpenTokenHistory: false })}
        />
      </Wrapper>
    );
  }
}
export default _.flow([connectWalletContext, connectAccountContext])(TokenTabs);

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
`;

const ButtonWrapper = styled.div`
  text-align: center;
  button {
    margin-bottom: 10px;
  }
`;
