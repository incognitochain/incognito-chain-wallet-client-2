import React from "react";
import styled from "styled-components";
import { Button, TextField } from "@material-ui/core";
import * as walletService from "../../services/WalletService";
import { CreateWalletPromptDialog } from "./CreateWalletPromptDialog";
import { useAppContext } from "../../common/context/AppContext";

export function Password({ history }) {
  const [password, setPassword] = React.useState("");
  const [isOpenCreateDialog, setIsOpenCreateDialog] = React.useState(false);
  const { listAccounts, appDispatch } = useAppContext();

  async function onSubmit(e) {
    try {
      e.preventDefault();
      walletService.savePassword(password);

      const wallet = await walletService.loadWallet();
      if (wallet) {
        history.push("/");
        listAccounts(wallet);
        appDispatch({ type: "SET_WALLET", wallet });
      } else {
        setIsOpenCreateDialog(true);
      }
    } catch (e) {
      console.error(e);
    }
  }

  async function onCreate() {
    try {
      const wallet = await walletService.initWallet();
      listAccounts(wallet);
      appDispatch({ type: "SET_WALLET", wallet });
      setIsOpenCreateDialog(false);
      history.push("/");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <Form onSubmit={onSubmit} noValidate>
      <TextField
        required
        type="password"
        label="Password"
        margin="normal"
        variant="outlined"
        value={password}
        onChange={e => setPassword(e.target.value)}
      />
      <ButtonWrapper>
        <Button
          disabled={!password}
          variant="contained"
          color="primary"
          type="submit"
        >
          Go
        </Button>
      </ButtonWrapper>

      <CreateWalletPromptDialog
        isOpen={isOpenCreateDialog}
        onClose={() => setIsOpenCreateDialog(false)}
        onCreate={onCreate}
      />
    </Form>
  );
}

const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
`;

const ButtonWrapper = styled.div`
  height: 56px;
  transform: translateY(4px);
  button {
    height: 56px;
  }
`;
