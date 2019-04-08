import React from "react";
import { CircularProgress } from "@material-ui/core";
import { Wrapper, Percent, Content } from "./styled";

import Account from "../../../services/Account";

export class Loading extends React.Component {
  state = {
    completed: 0
  };

  componentDidMount() {
    this.timer = setInterval(() => {
      this.progress();
    }, 90);
  }

  componentWillUnmount() {
    console.log("clearInterval");
    clearInterval(this.timer);
  }

  progress = () => {
    const completed = Account.getProgressTx();
    this.setState({ completed: completed });
  };

  render() {
    const { fullscreen } = this.props;
    return (
      <Wrapper style={{ flexFlow: "column" }}>
        <Content>
          <CircularProgress
            size={50}
            className={fullscreen.progress}
            color="primary"
          />
          <Percent>{this.state.completed}%</Percent>
        </Content>
      </Wrapper>
    );
  }
}
