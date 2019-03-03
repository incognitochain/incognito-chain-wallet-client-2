import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "@material-ui/core";

import { withStyles } from "@material-ui/core/styles";

import PrivacyKeys from "./PrivacyKeys";
import TokenTabs from "./TokenTabs";
import Account from "../../services/Account";
import styled from "styled-components";

const styles = theme => ({
  indicator: {
    backgroundColor: "#EBEFFA"
  },
  tabs: {
    backgroundColor: "#EBEFFA"
  },

  label: {
    color: "black"
  },

  selected: {
    backgroundColor: "white",
    fontWeight: "bold"
  }
});
class MainTabs extends React.Component {
  static propTypes = {
    paymentAddress: PropTypes.string.isRequired,
    readonlyKey: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      isExportDumpKey: false,
      privateKey: "",
      readonlyKey: ""
    };
  }
  async componentDidMount() {
    await this.getPrivateKey(this.props.paymentAddress);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.paymentAddress !== this.props.paymentAddress) {
      this.getPrivateKey(this.props.paymentAddress);
    }
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  getPrivateKey = async paymentAddress => {
    const result = await Account.getPrivateKey(paymentAddress);
    if (result && result.PrivateKey) {
      this.setState({ privateKey: result.PrivateKey });
    }
  };

  renderPrivacyKey = value => {
    if (value !== 1) return null;
    const { privateKey } = this.state;
    const props = {
      privateKey,
      ...this.props
    };
    return <PrivacyKeys {...props} />;
  };

  renderTokenTabs = value => {
    if (value !== 0) return null;

    const { paymentAddress } = this.props;
    const { privateKey } = this.state;
    const props = {
      paymentAddress: paymentAddress,
      privateKey: privateKey,
      ...this.props
    };
    return (
      <TokenTabs
        ref={component => {
          this.tokenTabsRef = component;
        }}
        {...props}
      />
    );
  };

  render() {
    const { value } = this.state; // TODO - use tabname for value instead of index number.
    const { classes } = this.props;
    const classesTab = {
      label: classes.label,
      selected: classes.selected,
      labelContainer: classes.labelContainer
    };
    return (
      <Wrapper>
        <Tabs
          classes={{
            root: classes.tabs,
            indicator: classes.indicator
          }}
          value={value}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          onChange={this.handleChange}
          className="tokenTabs"
        >
          <Tab classes={classesTab} label="TOKENS" />
          <Tab classes={classesTab} label="PRIVACY KEY" />
        </Tabs>
        {this.renderPrivacyKey(value)}
        {this.renderTokenTabs(value)}
      </Wrapper>
    );
  }
}
export default withStyles(styles)(MainTabs);

const Wrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;
