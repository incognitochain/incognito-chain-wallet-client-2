import React from 'react';
import PropTypes from 'prop-types';
//import { withStyles } from '@material-ui/core/styles';
import { Dialog  } from '@material-ui/core';

class ConfirmDialog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isOpen: false
    }
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);    
  }

  componentDidMount() {
    this.props.hasOwnProperty('onRef') && this.props.onRef(this);
  }

  componentWillUnmount() {
    this.props.hasOwnProperty('onRef') && this.props.onRef(undefined);
  }
  
  open(){
    if(this.modalRef){
      this.setState({isOpen: true});
    }
  }

  close(){
    if(this.modalRef){
      this.setState({isOpen: false});
    }
  }

  submit(){
    const { onOK } = this.props;
    if(this.modalRef){
      this.setState({isOpen: false});
    }

    if(onOK)
      onOK();
  }

  render() {
    const { title, header, children } = this.props;
    
    return (

      <div className="modal" ref={modal => this.modalRef = modal}>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth="md"
          open={this.state.isOpen}
        >
        <div className="card bg-light confirmDialog">
          <div className="card-header">{title}</div>
          <div className="card-body">
            <h5 className="card-title">{header}</h5>
            <div className="card-text mb-3">
              {children}
            </div>
            <p className="card-text text-right">
              <button className="btn btn-secondary mr-2" onClick={() => this.close()}>Cancel</button>
              <button className="btn btn-primary" onClick={() => this.submit()}>OK</button>
            </p>
          </div>
        </div>
          {/* <div className="bg-warning card text-white">
          <DialogTitle id="alert-dialog-title" className="card-header"></DialogTitle>
          <DialogContent className="card-body"> 
            <DialogContentText id="alert-dialog-description">
              <div className="dialog-description card-text">{children}</div>
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => this.close()} className="btn" color="default">
              Cancel
            </Button>
            <Button className="btn" color="primary" autoFocus>
              OK
            </Button>
          </DialogActions>
          </div> */}
        </Dialog>

      </div>
    );
  }
}

ConfirmDialog.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onRef: PropTypes.func,
  onClose: PropTypes.func,
};

export default (ConfirmDialog);

