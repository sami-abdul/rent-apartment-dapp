import React, { Component } from 'react';
import { connect } from 'react-redux';
import {logout} from '../store/actions/action'
import {Navbar, NavItem} from 'react-materialize';

class CustomNavbar extends Component {
    logoutHandler(){
        this.props.logoutUser()
    }
    render() {
        return (
            <Navbar className = 'teal grey darken-3' brand='Application' right>
            {
                (this.props.isLogin) ? 
                (<NavItem href='javascript:void(0)' onClick = {this.logoutHandler.bind(this)}>logout</NavItem>) :
                (<NavItem href='javascript:void(0)' title = 'Contact me at maazjawaid28@gmail.com'>Help</NavItem>)
            }
        </Navbar>
        )
    }
}

function mapStateToProp(state) {
    return ({
        isLogin : state.root.isLogin
    })
}


function mapDispatchToProp(dispatch) {
    return ({
        logoutUser: () => {
            dispatch(logout())
        }
    })
}

export default 
connect(mapStateToProp, mapDispatchToProp)(CustomNavbar);