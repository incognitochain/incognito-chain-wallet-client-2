import React from "react";
import { CircularProgress } from "@material-ui/core";
import styled from "styled-components";
import cls from "classnames";
import Account from "../../../services/Account";

// export function Loading({ isShow, fullscreen }) {
//   return isShow ? (
//     <Wrapper className={cls({ fullscreen })}>
//       <CircularProgress color="secondary" />
//     </Wrapper>
//   ) : null;
// }

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

  componentWillReceiveProps = nextProps => {
    const { isShow } = nextProps;
    if (isShow) {
      var that = this;
      clearInterval(this.timer);
      this.timer = setInterval(function() {
        that.progress(isShow);
      }, 90);
    } else if (isShow == false) {
      clearInterval(this.timer);
    }
  };

  progress = () => {
    const completed = Account.getProgressTx();
    this.setState({ completed: completed });
  };

  render() {
    const { fullscreen, isShow } = this.props;
    if (isShow) {
      return (
        <Wrapper style={{ flexFlow: "column" }}>
          <CircularProgress
            className={fullscreen.progress}
            variant="determinate"
            value={this.state.completed}
            color="secondary"
          />
          <div>{this.state.completed}%</div>
          {/* <CircularProgress

            className={classes.progress}
            variant="determinate"
            value={this.state.completed}
            color="secondary"
          /> */}
        </Wrapper>
      );
    }

    return null;
  }
}
