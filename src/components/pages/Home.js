import React from "react";
import PropTypes from "prop-types";

import AccountDetail from "../layout/Account/AccountDetail";

// TODO - remove this page or move AccountDetail into this
class Home extends React.Component {
  static propTypes = {
    account: PropTypes.array.isRequired
  };

  render() {
    const { account } = this.props;
    return <AccountDetail account={account} />;
  }
}

Home.propTypes = {};

export default Home;
