import React from "react";
import styled from "styled-components";
import {
  Button,
  Input,
  Grid,
  InputLabel,
  FormControl,
  CircularProgress
} from "@material-ui/core";
import blue from "@material-ui/core/colors/blue";
import toastr from "toastr";
import * as walletService from "../../services/WalletService";
import { CreateWalletPromptDialog } from "./CreateWalletPromptDialog";
import { useAppContext } from "../../common/context/AppContext";
import * as passwordService from "../../services/PasswordService";

const styles = theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  margin: {
    margin: theme.spacing.unit
  },
  cssLabel: {
    "&$cssFocused": {
      color: blue[500]
    }
  },
  cssFocused: {},
  cssUnderline: {
    "&:after": {
      borderBottomColor: blue[500]
    }
  },
  cssOutlinedInput: {
    "&$cssFocused $notchedOutline": {
      borderColor: blue[500]
    }
  },
  notchedOutline: {},
  bootstrapRoot: {
    "label + &": {
      marginTop: theme.spacing.unit * 3
    }
  },
  bootstrapInput: {
    borderRadius: 4,
    position: "relative",
    backgroundColor: theme.palette.common.white,
    border: "1px solid #ced4da",
    fontSize: 16,
    width: "auto",
    padding: "10px 12px",
    transition: theme.transitions.create(["border-color", "box-shadow"]),
    // Use the system font instead of the default Roboto font.
    fontFamily: [
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Roboto",
      '"Helvetica Neue"',
      "Arial",
      "sans-serif",
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"'
    ].join(","),
    "&:focus": {
      borderRadius: 4,
      borderColor: "#80bdff",
      boxShadow: "0 0 0 0.2rem rgba(0,123,255,.25)"
    }
  },
  bootstrapFormLabel: {
    fontSize: 18
  }
});

export function Password({ history }) {
  const classes = styles;
  const [password, setPassword] = React.useState("");
  const [isOpenCreateDialog, setIsOpenCreateDialog] = React.useState(false);
  const { listAccounts, appDispatch } = useAppContext();
  const [isLoading, setLoading] = React.useState(false);

  async function onSubmit(e) {
    try {
      e.preventDefault();
      setLoading(true);

      passwordService.savePassword(password);

      const wallet = await walletService.loadWallet();

      if (wallet) {
        history.push("/");
        listAccounts(wallet);
        appDispatch({ type: "SET_WALLET", wallet });
      } else {
        setIsOpenCreateDialog(true);
      }
    } catch (e) {
      toastr.error("Login failed, please try again.");
      console.error(e);
    } finally {
      setLoading(false);
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
    <UnlockPage style={{ flexGrow: "1" }}>
      <Grid
        container
        justify={"center"}
        alignItems={"center"}
        direction={"row"}
      >
        <Grid item xs={12}>
          <Logo>
            <img
              src="https://constant.money/public/assets/logo-5321c8fe.svg"
              alt=""
            />
          </Logo>
        </Grid>
        <Grid item xs={12}>
          <Title>Welcome Back!</Title>
        </Grid>
        <Grid item xs={12}>
          <SubTitle>The decentralized web awaits</SubTitle>
        </Grid>
        <Grid item xs={12} style={{ textAlign: "center" }}>
          <Form onSubmit={onSubmit} noValidate>
            <Grid container>
              <Grid item xs={12} style={{ marginBottom: "10px" }}>
                <FormControl className={classes.margin}>
                  <InputLabel
                    htmlFor="walletPassword"
                    classes={{
                      root: classes.cssLabel,
                      focused: classes.cssFocused
                    }}
                  >
                    Password
                  </InputLabel>
                  <Input
                    id="walletPassword"
                    required
                    type="password"
                    label="Password"
                    margin="normal"
                    variant="outlined"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <ButtonWrapper>
                  {isLoading ? (
                    <CircularProgress />
                  ) : (
                    <Button
                      style={{ color: "#fff", backgroundColor: "#4254A4" }}
                      className={"loginButton"}
                      disabled={!password}
                      variant="contained"
                      color="primary"
                      type="submit"
                    >
                      LOG IN
                    </Button>
                  )}
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
`;

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
`;

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
`;

const SubTitle = styled.div`
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
  color: #aeaeae;
  text-align: center;
`;
