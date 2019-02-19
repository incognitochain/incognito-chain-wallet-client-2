
import React from 'react';
import PropTypes from 'prop-types';
import { TextField, Button } from '@material-ui/core';
import ConfirmDialog from '../../core/ConfirmDialog'
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import Token from '../../../services/Token';

import './CreateToken.scss';

const toAddressFocus = input => {
    input && input.focus();
  };

class CreateToken extends React.Component {
    static propTypes = {
        paymentAddress: PropTypes.string.isRequired,
        privateKey: PropTypes.string.isRequired,
        balance: PropTypes.number,
        toAddress: PropTypes.string,
        tokenName: PropTypes.string,
        tokenId: PropTypes.string,
        tokenSymbol: PropTypes.string.isRequired,
        type: PropTypes.number.isRequired,
        isCreate: PropTypes.bool.isRequired,
        onClose: PropTypes.func
    }
    static defaultProps = {
        tokenId: '',
        tokenName: '',
        tokenSymbol: '',
        balance: 0,
        toAddress: ''
    }
    constructor(props) {
        super(props);
        this.state = {
            submitParams: [],
            amount: 0,
            alertOpen: false,
            isAlert: false,
            error: null,
        }
    }
    validate = ({toAddress, amount, tokenName, tokenSymbol}) => {
        const { balance, isCreate } = this.props;
        if (!isCreate && amount > balance) return false;
        if (toAddress.length > 0 && amount > 0 && tokenName.length > 0 && tokenSymbol.length > 0) return true;
        return false;
    }
    handleSubmit = (event) => {
        event.preventDefault();
        const { privateKey, isCreate,tokenId, balance  } = this.props;
        const toAddress = event.target.toAddress.value || '';
        const amount = Number(event.target.amount.value);
        const tokenName = event.target.tokenName.value || '';
        const tokenSymbol = event.target.tokenSymbol.value || '';
        const tokenReceiver = {};
        tokenReceiver[toAddress]= amount;
        const objectSend = {
            TokenID: tokenId || '',
            TokenName: tokenName,
            TokenSymbol: tokenSymbol,
            TokenTxType: isCreate ? 0 : 1,
            TokenAmount: amount,
            TokenReceivers: tokenReceiver
        }
        const params = [privateKey, 0, -1, objectSend];
        this.setState({
            submitParams: params,
            amount
        });
        
        if(this.validate({toAddress, amount, tokenName, tokenSymbol})){
            this.modalConfirmationRef.open();
        } else {
            
            this.setState({
                error: isCreate ? `Please fill all fields.` : `Please fill all fields and amount limit in ${balance} token.`
            });
        }
        
    }
    closePage = () => {
        this.showSuccess();
    }
    handleAlertOpen = () => {
        this.setState({ alertOpen: true });
      };
    
    handleAlertClose = () => {
        this.setState({ alertOpen: false });
        this.props.onClose();

    };
    renderError(){
        const {error} = this.state;
        if(!error) return null;
        return (
            <div className="errorField">
            *{error}
            </div>
        )
    }
    renderAlert() {
        const { isCreate } = this.props;
        const title = isCreate ? 'Created Token' : 'Sent Token';
        const message = isCreate ? 'The new token is created' : 'The token is sent';
        return (
            <Dialog
                open={this.state.alertOpen}
                onClose={this.handleAlertClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                >
                <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                    {message}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={this.handleAlertClose} color="primary">
                    OK
                    </Button>
                </DialogActions>
        </Dialog>
        );
    }
    showSuccess = () => {
        this.handleAlertOpen();
        
    }
    createSendCustomTokenTransaction = async (params) => {
        const results = await Token.createSendCustomTokenBalance(params);
        console.log('Result:', results);
        const { Error: error } = results;
        if (error) {
            console.log('Error', error);   
            this.setState({
                error: error
            });  
        }else {
            this.closePage();
        }
    }
    createSendPrivacyTokenTransaction = async (params) => {
        const results = await Token.createSendPrivacyCustomTokenTransaction(params);
        console.log('Result:', results);
        const { Error: error } = results;
        if (error) {
            console.log('Error', error);  
            this.setState({
                error: error
            });    
        }else {
            this.closePage();
        }
    }
    createOrSendToken = ()=> {
        const { type } = this.props;
        const { submitParams } = this.state;
        if(type===0) {
            this.createSendCustomTokenTransaction(submitParams);
        }else {
            this.createSendPrivacyTokenTransaction(submitParams);
        }
    }
    renderTokenName() {
        const { isCreate, tokenName, tokenSymbol } = this.props;
        return (
            <div className="wrapperTokenName">
                <TextField
                    required
                    id="tokenName"
                    name="tokenName"
                    label="Name"
                    className="textField"
                    margin="normal"
                    variant="outlined"
                    defaultValue={tokenName|| ''}
                    disabled={isCreate ? false : true}
                />
                <TextField
                    required
                    id="tokenSymbol"
                    name="tokenSymbol"
                    label="Symbol"
                    className="textField"
                    margin="normal"
                    variant="outlined"
                    defaultValue={tokenSymbol|| ''}
                    disabled={isCreate ? false : true}

                />
            </div>
        );
    }
    renderBalance() {
        const { isCreate, balance } = this.props;
        if(isCreate) return null;
        return (
            <div className="text-right">
            Balance: { balance ? Math.round(balance).toLocaleString() : 0} TOKEN
            </div>
        );
    }
    renderForm() {
        const { paymentAddress, toAddress } = this.props;

        return (
            <form onSubmit={this.handleSubmit}>
            {this.renderBalance()}
            <TextField
                required
                disabled
                id="fromAddress"
                name="fromAddress"
                label="From"
                className="textField"
                margin="normal"
                variant="outlined"
                value={paymentAddress}
                />
                

                <TextField
                required
                id="toAddress"
                name="toAddress"
                label="To"
                className="textField"
                inputRef={toAddressFocus}
                margin="normal"
                variant="outlined"
                defaultValue={toAddress}
                />
                
                {this.renderTokenName()}
                <TextField
                required
                id="amount"
                name="amount"
                label="Amount"
                className="textField"
                margin="normal"
                variant="outlined"
                type="number"
                />

                <Button type="submit" variant="contained" size="large" color="primary" className="button" fullWidth
                >
                    Send
                </Button>
            </form>
        );
    }
    renderConfirmDialog() {
        const { amount } = this.state;
        return (
            <ConfirmDialog title="Confirmation" onRef={modal => this.modalConfirmationRef = modal} onOK={()=> this.createOrSendToken()}className={{margin: 0}}>
            <div>Are you sure to transfer out {amount} TOKEN?</div>
            </ConfirmDialog>
        );
    }
    render() {
        return (
            <div className="wrapperCreateToken">
                {this.renderForm()}
                {this.renderError()}
                {this.renderConfirmDialog()}
                {this.renderAlert()}
            </div>
        );
    }
}
export default CreateToken;
