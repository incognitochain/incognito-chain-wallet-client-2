import React from "react";
import PropTypes from "prop-types";

import AccountDetail from "../layout/Account/AccountDetail";

class Home extends React.Component {
  static propTypes = {
    account: PropTypes.array.isRequired
  };

  render() {
    const { account } = this.props;
    return (
      <div className="">
        {<AccountDetail account={account} onFinish={() => this.reload()} />}
      </div>
    );
  }
}

Home.propTypes = {};

export default Home;
