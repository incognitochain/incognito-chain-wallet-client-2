import React from "react";
import Popover from "@material-ui/core/Popover";
import { withStyles } from "@material-ui/core/styles";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { ReactComponent as CopyPasteSVG } from "assets/images/copy-paste.svg";
import toastr from "toastr";
import styled from "styled-components";

const styles = theme => ({
  popover: {
    pointerEvents: "none"
  },
  paper: {
    padding: theme.spacing.unit
  }
});

const CopyableTooltip = props => {
  const [anchorEl, setAnchorEl] = React.useState();

  const handlePopoverOpen = event => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const onCopy = () => {
    handlePopoverClose();
    toastr.success("Copied!");
  };

  const { children, title } = props;

  const open = Boolean(anchorEl);

  return (
    <>
      <div onClick={handlePopoverOpen}>{children}</div>
      <Popover
        id="simple-popper"
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center"
        }}
        // transformOrigin={{
        //   vertical: "top",
        //   horizontal: "center"
        // }}
      >
        <CopyToClipboard text={title} onCopy={onCopy}>
          <CopyContentWrapper>
            <Title>{title}</Title>
            <IconWrapper>
              <CopyPasteSVG />
            </IconWrapper>
          </CopyContentWrapper>
        </CopyToClipboard>
      </Popover>
    </>
  );
};

export default withStyles(styles)(CopyableTooltip);

const CopyContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 6px;
  cursor: pointer;
  position: relative;
  height: 36px;
`;

const Title = styled.div`
  flex: 1;
  padding-right: 5px;
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  background-color: #e6e9ff;
  width: 46px;
  text-align: center;
  line-height: 33px;
`;
