import React from "react";
import PropTypes from "prop-types";
import { Tabs, Tab } from "@material-ui/core";

import { withStyles } from "@material-ui/core/styles";

import PrivacyKeys from "./PrivacyKeys";
import TokenTabs from "./TokenTabs";
import styled from "styled-components";
import { History } from "../../modules/history/History";

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

const mapTabNameToIndex = {
  tokens: 0,
  history: 1,
  privacyKey: 2
};

const renderIf = cond => cmp => (cond ? cmp : null);

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
      readonlyKey: ""
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  };

  renderPrivacyKey = () => {
    return <PrivacyKeys {...this.props} />;
  };

  renderTokenTabs = () => {
    const { paymentAddress } = this.props;
    const props = {
      paymentAddress: paymentAddress,
      ...this.props
    };
    return <TokenTabs {...props} tokenListRef={this.props.tokenListRef} />;
  };

  renderHistory = () => {
    return <History onSendConstant={this.props.onSendConstant} />;
  };

  render() {
    const { value } = this.state; // TODO - use tabname for value instead of index number.
    const { classes } = this.props;
    const classesTab = {
      root: "MainTabItem",
      label: classes.label,
      selected: classes.selected,
      labelContainer: classes.labelContainer
    };
    return (
      <Wrapper className="MainTabs">
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
          <StyledTab classes={classesTab} label="TOKENS" />
          <StyledTab classes={classesTab} label="HISTORY" />
          <StyledTab classes={classesTab} label="ACCOUNT DETAIL" />
        </Tabs>
        {renderIf(value === mapTabNameToIndex["tokens"])(
          this.renderTokenTabs()
        )}
        {renderIf(value === mapTabNameToIndex["history"])(this.renderHistory())}
        {renderIf(value === mapTabNameToIndex["privacyKey"])(
          this.renderPrivacyKey()
        )}
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

const StyledTab = styled(Tab)`
  flex: 1;
  &.MainTabItem {
    min-width: initial;
  }
`;
