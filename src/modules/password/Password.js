import React from "react";
import styled from "styled-components";
import {Button, Input, Grid} from "@material-ui/core";
import * as walletService from "../../services/WalletService";
import {CreateWalletPromptDialog} from "./CreateWalletPromptDialog";
import {useAppContext} from "../../common/context/AppContext";
import * as passwordService from "../../services/PasswordService";

export function Password({history}) {
  const [password, setPassword] = React.useState("");
  const [isOpenCreateDialog, setIsOpenCreateDialog] = React.useState(false);
  const {listAccounts, appDispatch} = useAppContext();

  async function onSubmit(e) {
    try {
      e.preventDefault();
      passwordService.savePassword(password);

      const wallet = await walletService.loadWallet();
      if (wallet) {
        history.push("/");
        listAccounts(wallet);
        appDispatch({type: "SET_WALLET", wallet});
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
      appDispatch({type: "SET_WALLET", wallet});
      setIsOpenCreateDialog(false);
      history.push("/");
    } catch (e) {
      console.error(e);
    }
  }

  return (
    <UnlockPage style={{flexGrow: "1"}}>
      <Grid container justify={"center"} alignItems={"center"} direction={"row"}>
        <Grid item xs={12}>
          <Logo>
            <img src="https://constant.money/public/assets/logo-5321c8fe.svg" alt=""/>
          </Logo>
        </Grid>
        <Grid item xs={12}>
          <Title>Welcome Back!</Title>
        </Grid>
        <Grid item xs={12}>
          <SubTitle>The decentralized web awaits</SubTitle>
        </Grid>
        <Grid item xs={12} style={{textAlign: "center"}}>
          <Form onSubmit={onSubmit} noValidate>
            <Grid container>
              <Grid item xs={12} style={{marginBottom: "10px"}}>
                <Input
                  required
                  type="password"
                  label="Password"
                  margin="normal"
                  variant="outlined"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={"Password"}
                />
              </Grid>
              <Grid item xs={12}>
                <ButtonWrapper>
                  <Button style={{color: "#fff", backgroundColor: "#4254A4"}} className={"loginButton"}
                          disabled={!password}
                          variant="contained"
                          color="primary"
                          type="submit"
                  >
                    LOG IN
                  </Button>
                </ButtonWrapper>
              </Grid>
            </Grid>
            <CreateWalletPromptDialog
              isOpen={isOpenCreateDialog}
              onClose={() => setIsOpenCreateDialog(false)}
              onCreate={onCreate}
            />
          </Form>
        </Grid>
      </Grid>
    </UnlockPage>
  );
}

const UnlockPage = styled.div`
  padding: 30px;
`

const Form = styled.form`
  flex: 1;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-top: 50px;
`;

const Logo = styled.div`
  text-align: center;
`

const ButtonWrapper = styled.div`
  height: 56px;
  transform: translateY(4px);
  button {
    height: 56px;
  }
`;

const Title = styled.div`
  margin-top: 5px;
  font-size: 2rem;
  font-weight: 800;
  color: #4d4d4d;
  text-align: center;
`

const SubTitle = styled.div`
    margin: 0;
    padding: 0;
    border: 0;
    font-size: 100%;
    font: inherit;
    vertical-align: baseline;
    color: #aeaeae;
    text-align: center;
`
