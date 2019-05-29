import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import routeName from '@src/router/routeName';
import serverService from '@src/services/wallet/Server';
import { getPassphrase, savePassword } from '@src/services/wallet/PasswordService';
import { openSnackbar } from '@src/components/core/Snackbar';
import { setWallet, reloadWallet, initWalletAction } from '@src/redux/actions/wallet';
import { CONSTANT_CONFIGS } from '@src/constants';


const Splash = ({ history, reloadWallet, initWalletAction }) => {
  const initServer = async () => {
    try {
      if (!await serverService.get()) {
        return serverService.setDefault();
      }
    } catch {
      openSnackbar({ message: 'Error occurs while setting server list', type: 'error' });
    }
  };

  const handleInitWallet = () => {
    return initWalletAction();
  };

  const handleLoadWallet = async () => {
    try {
      await savePassword(CONSTANT_CONFIGS.DEFAULT_PASSPHRASE);
      const passphrase = await getPassphrase();
      const wallet = await reloadWallet(passphrase);

      return wallet;
    } catch(e) {
      throw e;
    }
  };

  const handleEffect = () => {
    const checkWallet = async () => {
      let wallet = null;
      try {
        await initServer().catch(() => throw new Error('Init server failed'));
        wallet = await handleLoadWallet().catch(() => throw new Error('Wrong PIN (or passphrase)'));

        // create new wallet
        if (!wallet) {
          wallet = await handleInitWallet().catch(() => throw new Error('Error occurs while creating new wallet'));
          openSnackbar({ message: 'Your wallet was created', type: 'success' });
        } else {
          openSnackbar({ message: 'Your wallet was loaded', type: 'success' });
        }

        history?.push(routeName.Home);
      } catch (e) {
        openSnackbar({ message: e?.message, type: 'error' });
      }
    };

    checkWallet();
  };

  useEffect(handleEffect, []);

  return (
    <div>
      <p>Loading your wallet...</p>
    </div>
  );
};

Splash.propTypes = {
  history: PropTypes.object,
  initWalletAction: PropTypes.func.isRequired,
  reloadWallet: PropTypes.func.isRequired,
};

const mapDispatch = { setWallet, reloadWallet, initWalletAction };

export default connect(null, mapDispatch)(Splash);