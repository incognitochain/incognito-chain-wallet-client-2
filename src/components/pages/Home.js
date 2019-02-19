import React from 'react';
import PropTypes from 'prop-types';

import AccountDetail from '../layout/Account/Detail';

class Home extends React.Component {
  static propTypes = {
    account: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);
    this.state = {
    }
    
  }
  componentWillReceiveProps(nextProps) {
  }

  render() {
    const { account } = this.props;
    return (
      <div className="">
        {<AccountDetail account={account} onFinish={() => this.reload()} />}
      </div>
    );
  }
}

Home.propTypes = {
};

export default Home;
