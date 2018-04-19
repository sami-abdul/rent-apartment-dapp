import React, { Component } from 'react';
import { connect } from 'react-redux';
import { signinAction, errorMessage } from '../store/actions/action';
import { Col, ProgressBar, Row, Input, Button ,Modal,modal} from 'react-materialize';
import {
    Link
} from 'react-router-dom';
import $ from "jquery";

const contract = require('truffle-contract')

import DataControllerContract from '../../build/contracts/DataController.json'
import getWeb3 from '../utils/getWeb3'

var dataControllerContract
var deployedInstance
var mAccounts

const divStyle = {
    marginLeft: '700px',
    marginTop:"250px"
  };

class Signin extends Component {

    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: '',
            web3: null
        }
        this.signin = this.signin.bind(this);
        this._onChangeEmail = this._onChangeEmail.bind(this);
        this._onChangePassword = this._onChangePassword.bind(this);
    }

    instantiateContract() {
        dataControllerContract = contract(DataControllerContract)
        dataControllerContract.setProvider(this.state.web3.currentProvider)

        this.state.web3.eth.getAccounts((error, accounts) => {
          dataControllerContract.deployed().then((instance) => {
            deployedInstance = instance
            mAccounts = accounts
            this.getData()
          })
        })
    }

    signin(event) {
        event.preventDefault();
        if((this.state.email === '' || this.state.password === ''))
        {
            this.props.errorMessage('Both the fields are required!');
        }
        else{
            let user = {
                email: this.state.email,
                password: this.state.password
            }
            this.props.signinWithEmailPassword(user);
        }
    }

    _onChangeEmail(event) {
        this.setState({
            email: event.target.value
        })
    }

    _onChangePassword(event) {
        this.setState({
            password: event.target.value
        })
    }

    componentWillMount(){
        this.props.errorMessage('');
    }

    render() {
        return (
            <div>
    <Row >
                <Col s={3}></Col>
                <Col s={6} style = {{height : '400px',  borderTop : 'none'}}>
                    
                    <form onSubmit={this.signin.bind(this)}>
                        <Input s= {12} type="email" name='email' value={this.state.email} title = 'type password here' onChange={this._onChangeEmail} label="Email" validate></Input>
                        <br />
                        <Input s= {12} type='password' name='password' value={this.state.password} title = 'type email here' onChange={this._onChangePassword} label='Password' validate/>
                        <br />
                        <Button className="btn waves-effect waves-light" type="submit" name="action" title = 'Sign In' style = {{display : 'block'}}>Signin</Button>
                        <Link to='/signup'>Create Account</Link>
                    <div><p style = {{color : "red"}}>{this.props.errorMsg}</p></div>
                    </form>
                    {
                        (this.props.progressBarDisplay) ? (
                            <Col s={12}>
                                <ProgressBar />
                            </Col>
                        ) :
                            null
                    }
                </Col>
                <Col s={3}></Col>
            </Row>
{/* </Modal> */}
</div>
        )
    }
}

function mapStateToProp(state) {
    return ({
        progressBarDisplay: state.root.progressBarDisplay,
        errorMsg : state.root.errorMessage
    })
}
function mapDispatchToProp(dispatch) {
    return ({
        signinWithEmailPassword: (user) => {
            dispatch(signinAction(user))
        },
        errorMessage: (message)=>{
            dispatch(errorMessage(message));
        }
    })
}

export default connect(mapStateToProp, mapDispatchToProp)(Signin);