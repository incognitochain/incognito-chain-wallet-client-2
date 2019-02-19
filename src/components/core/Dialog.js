import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Dialog, IconButton, Toolbar, AppBar, Slide, Typography } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

const Transition = (props) => {
  return <Slide direction="up" {...props} />;
}

const styles = {
  appBar: {
    position: 'relative',
  },
  flex: {
    flex: 1,
  },
};

class Modal extends React.Component {
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
    const { onClose } = this.props;
    if(this.modalRef){
      this.setState({isOpen: false});
    }

    if(onClose)
      onClose();
  }

  render() {
    const { title, children, buttonAction, classes } = this.props;
    
    return (

      <div className="modal" ref={modal => this.modalRef = modal}>
        <Dialog
          fullScreen
          open={this.state.isOpen}
          onClose={this.close}
          TransitionComponent={Transition}
        >
          <AppBar className={classes.appBar}>
            <Toolbar style={{padding: '0 10px'}}>
              <IconButton color="inherit" onClick={() => this.close()} aria-label="Close">
                <CloseIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={classes.flex}>
                {title}
              </Typography>
              { buttonAction }
            </Toolbar>
          </AppBar>
          <div>
            {children}
          </div>
        </Dialog>

      </div>
    );
  }
}

Modal.propTypes = {
  classes: PropTypes.object.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  onRef: PropTypes.func,
  onClose: PropTypes.func,
  hideButtonClose: PropTypes.bool,
  buttonAction: PropTypes.any
};

export default withStyles(styles)(Modal);

