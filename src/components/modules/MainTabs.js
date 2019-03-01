import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "@material-ui/core";

import { withStyles } from "@material-ui/core/styles";

import PrivacyKeys from "./PrivacyKeys";
import TokenTabs from "./TokenTabs";
import Account from "../../services/Account";

const styles = theme => ({
  root: {
    flexGrow: 1
  },
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
  renderHistory = value => {
    if (value !== 2) return null;
    return <div />;
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

  renderTabs() {
    const { value } = this.state;
    const { classes } = this.props;
    const classesTab = {
      label: classes.label,
      selected: classes.selected,
      labelContainer: classes.labelContainer
    };
    return (
      <div className={styles.root} style={{ width: "100%" }}>
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
          {/*<Tab
                    classes={classesTab} 
                     label="HISTORY" />*/}
          <Tab classes={classesTab} label="TOKENS" />
          <Tab classes={classesTab} label="PRIVACY KEY" />
        </Tabs>
        {this.renderPrivacyKey(value)}
        {this.renderHistory(value)}
        {this.renderTokenTabs(value)}
      </div>
    );
  }

  render() {
    return <div className="wrapperMainTabs">{this.renderTabs()}</div>;
  }
}
export default withStyles(styles)(MainTabs);
