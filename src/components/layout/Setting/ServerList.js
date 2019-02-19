import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { List, ListItem, ListItemIcon, 
  ListItemText, Divider, Button,
  CircularProgress, ListItemSecondaryAction, 
  Collapse, Snackbar, Tooltip } from '@material-ui/core';

import { 
  Error as IconError,
  CheckCircle as IconSuccess,
  Warning as IconWarning,
  Star as IconStar, 
  ExpandLess, 
  ExpandMore, 
  StarBorder
} from '@material-ui/icons';

import Server from '../../../services/Server';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit
  },
  progress: {
    position: 'absolute',
    left: 'calc(50% - 25px)',
    top: '10rem'
  },
  nested: {
    paddingLeft: theme.spacing.unit * 4,
  },
});

class ServerList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      serverSelected: false,
      servers: [],
      loading: false,
      showAlert: '',
      isAlert: false,
    }
  }

  componentDidMount(){
    this.getSettingServers();
  }


  handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    this.setState({ showAlert: '', isAlert: false });
  }


  showAlert = (msg, {flag='warning', html=false, duration=2000, hideIcon=false}) => {
    let showAlert = '', isAlert = true, icon = '';

    if(flag === 'success')
      icon = <IconSuccess />;
    else if(flag === 'danger')
      icon = <IconError />;
      else if(flag === 'warning')
      icon = <IconWarning />;

    this.setState({isAlert}, ()=> {
      showAlert = <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        open={isAlert}
        autoHideDuration={duration}
        onClose={this.handleClose}
      >
        <div className={"alert alert-"+flag} role="alert">{!hideIcon && icon} {msg}</div>
      </Snackbar>

      this.setState({showAlert});
    });
  }

  showSuccess = (msg) => {
    this.showAlert(msg, {flag: 'success', duration: 3000, hideIcon: true});
  }

  showWarning = (msg) => {
    this.showAlert(msg, {flag: 'warning'});
  }

  showError = (msg) => {
    this.showAlert(msg, {flag: 'danger'});
  }

  async getSettingServers(){
    this.setState({loading: true, servers: []});
    const servers = await Server.get();
    this.setState({loading: false, servers});
  }

  openServerDetail = (server) => {
    let servers = this.state.servers;
    for(let s of servers){
      if(server.address === s.address){
        s.open = !s.open;
        break;
      }
    }

    this.setState({servers});
  }

  defaultServerDetail = (server) => {
    let servers = this.state.servers;
    for(let s of servers){
      if(server.address === s.address){
        s.default = true;
      }
      else{
        s.default = false;
      }
    }

    Server.set(servers);
    this.setState({servers});
  }

  removeServer = (server) => {
    let servers = this.state.servers;
    for(let i in servers){
      if(servers[i].address === server.address){

        if(servers[i].default){
          this.showWarning('Default server could not be removed!');
          break;
        }
        else{
          servers.splice(i, 1);
          Server.set(servers);
          this.setState({servers});
          break;
        }
      }
    }
  }

  render() {
    const { classes } = this.props;
    const { loading, servers, showAlert } = this.state;

    return (
      <div>
        {showAlert}
        {
          servers.length && servers.map(s => {
          return (
            <List component="nav" key={Math.random()} >
              <ListItem button >
                <Tooltip title="Set default server">
                  <ListItemIcon onClick={()=> this.defaultServerDetail(s)}>
                    {s.default ? <IconStar className="text-primary" /> : <StarBorder />}
                  </ListItemIcon>
                </Tooltip>
                <ListItemText inset primary={s.name ? s.name : "<Unnamed>"} secondary={s.address} onClick={()=> this.openServerDetail(s)} />
                {s.open ? <ExpandLess onClick={()=> this.openServerDetail(s)} /> : <ExpandMore onClick={()=> this.openServerDetail(s)} />}
              </ListItem>
              <Collapse in={s.open} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  <ListItem button className={classes.nested}>
                    <ListItemText inset primary={"Username: " + s.username} secondary={"Password: " + s.password} />
                  </ListItem>
                  <ListItemSecondaryAction>
                    {
                      !s.default && <Button variant="contained" size="small" color="secondary" onClick={() => this.removeServer(s)} >Remove</Button>
                    }
                  </ListItemSecondaryAction>
                </List>
              </Collapse>
              <Divider />
            </List>)
          })
        }
        {
          !loading && !servers.length && <div className="text-center">
            {/* <img src={img1} alt="" /> */}
            <h3 className="text-secondary mt-3">Not found server(s)</h3>
          </div> 
        }
        {
          loading && <CircularProgress className={classes.progress} color="secondary" />
        }
      </div>
    );
  }
}

ServerList.propTypes = {
  classes: PropTypes.object.isRequired,

};

export default withStyles(styles)(ServerList);

