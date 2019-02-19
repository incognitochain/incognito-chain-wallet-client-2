import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';
import Avatar from '@material-ui/core/Avatar';

class TokenItem extends React.Component {
    static propTypes = {
        item: PropTypes.object.isRequired,
        onSendToken: PropTypes.func
    }
    static defaultProps = {
    }
    handleClickButton = () => {
        const { onSendToken, item, tab } = this.props;
        onSendToken(item, tab);
    }
   
    render() {
        const { item } = this.props;
        const { Amount, Name, TokenImage } = item;
        return (
            <div className="wrapperToken">
                <div className="wrapperTokenItem">
                    <div className="wrapperTokenInfo">
                        <div className="wrapperName">
                            <Avatar alt="avatar" src={TokenImage} />
                            <div className="wrapperTokenDetail">
                                <div className="tokenName">{Name}</div>
                                <div className="tokenAmount">{Amount.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                    <Button 
                    variant="contained" 
                    size="medium" 
                    className="tokenButton"
                    onClick={this.handleClickButton} >
                    Send
                    </Button>
                </div>
                <div className="line"/>
            </div>
        );
    }
}

class TokenList extends React.Component {
    static propTypes = {
        list: PropTypes.array.isRequired
    }
    renderEmpty = (list) => {
        if (list.length > 0) return null;
        return (
            <div className="wrapperTokenEmpty">
                <div className="emptyHeader">NO TOKEN PRIVACY.</div>
                <div className="emptyDes">You can always easily create your own one.</div>
            </div>
        );
    }
    render() {
        const { list } = this.props; 
        return (
            <div className="wrapperTokenList">
            {this.renderEmpty(list)}
            {list.map((item, index) => (
                <TokenItem key={index} item={item} {...this.props} />
            ))}
            </div>
        );
    }
}
export default TokenList;