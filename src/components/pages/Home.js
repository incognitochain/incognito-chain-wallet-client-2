import React from "react";
import PropTypes from "prop-types";

import AccountDetail from "../layout/Account/AccountDetail";
import styled from "styled-components";

class Home extends React.Component {
  static propTypes = {
    account: PropTypes.array.isRequired
  };

  render() {
    const { account } = this.props;
    return (
      <Wrapper>
        {<AccountDetail account={account} onFinish={() => this.reload()} />}
      </Wrapper>
    );
  }
}

Home.propTypes = {};

export default Home;

const Wrapper = styled.div`
  display: flex;
  flex: 1;
`;
