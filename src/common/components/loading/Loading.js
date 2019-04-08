import React from "react";
import { CircularProgress } from "@material-ui/core";
import styled from "styled-components";

import Account from "../../../services/Account";

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(255, 255, 255, 0.25);
  &.fullscreen {
    position: fixed;
  }
`;

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
        <CircularProgress
          className={fullscreen.progress}
          variant="determinate"
          value={this.state.completed}
          color="secondary"
        />
        <div>{this.state.completed}%</div>
      </Wrapper>
    );
  }
}
