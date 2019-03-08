import React from "react";
import { ListItemText, ListItem, Avatar, Button } from "@material-ui/core";

import { Remove as IconRemove } from "@material-ui/icons";

import "./PrivacyKeys.scss";
import styled from "styled-components";

import { PrivacyKeyDialog } from "../../modules/privacy-key/PrivacyKeyDialog";

class PrivacyKeys extends React.Component {
  state = {};
  handleOnRemoveAccount = () => {
    this.props.onRemoveAccount();
  };

  renderRemoveAccount = () => {
    return (
      <ListItem>
        <Avatar>
          <IconRemove />
        </Avatar>
        <ListItemText
          disableTypography
          primary={
            <span className="btn text-danger cursor-pointer pl-0">
              Remove account
            </span>
          }
          onClick={this.handleOnRemoveAccount}
        />
      </ListItem>
    );
  };

  render() {
    return (
      <div className="wrapperPrivacyKeyContainer">
        <ButtonWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({ showKeyModal: true })}
          >
            Show Privacy Key
          </Button>
        </ButtonWrapper>

        <PrivacyKeyDialog
          isOpen={this.state.showKeyModal}
          onClose={() => this.setState({ showKeyModal: false })}
        />

        {this.renderRemoveAccount()}
      </div>
    );
  }
}
export default PrivacyKeys;

const ButtonWrapper = styled.div`
  text-align: center;
`;
