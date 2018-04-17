import React, { Component } from 'react';
import { connect } from 'react-redux';
import { signupAction, errorMessage, typeCheck } from '../store/actions/action';
import {
    Link
} from 'react-router-dom';
import { Col, ProgressBar, Row, Input, Button, Dropdown, NavItem,Select,Modal } from 'react-materialize';
import Background from '../images/img1.jpg';

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

class Signup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            firstName: '',
            lastName: '',
            password: '',
            wallet: '',
            type:''
        }
        this.signup = this.signup.bind(this);
        this._onChangeEmail = this._onChangeEmail.bind(this);
        this._onChangeUserName = this._onChangeUserName.bind(this);
        this._onChangePassword = this._onChangePassword.bind(this);
        this._onChangLastName = this._onChangLastName.bind(this);
        this._onChangeType=this._onChangeType.bind(this);
        this._onChangeWallet=this._onChangeWallet.bind(this);
    }

    signup(event) {
        event.preventDefault();
        if ((this.state.firstName === '' || this.state.lastName === '' || this.state.email === '' || this.state.password === '' 
        || this.state.wallet === ''
    )) {
            this.props.errorMessage('All the fields are required!');
        }
        else {
            let user = {
                email: this.state.email,
                firstName: this.state.firstName,
                lastName: this.state.lastName,
                password: this.state.password,
                type: this.state.type,
                firstTime: true,
                wallet: this.state.wallet
            }
            console.log(user)
            this.props.signupwithEmailPassword(user);
            this.props.typeChecker(this.state.type);
            // this.props.type=this.state.type;
        }
    }
    _onChangeType(ev){
        console.log(ev.target.value);
        this.setState({
            type:ev.target.value
        })
    }

    _onChangeEmail(event) {
        this.props.errorMessage('');
        this.setState({
            email: event.target.value
        })
    }
    _onChangeUserName(event) {
        this.setState({
            firstName: event.target.value
        })
    }
    _onChangePassword(event) {
        this.setState({
            password: event.target.value
        })
    }
    _onChangeWallet(event) {
        this.setState({
            wallet: event.target.value
        })
    }
    _onChangLastName(event) {
        this.setState({
            lastName: event.target.value
        })
    }
    componentWillMount() {
        this.props.errorMessage('');
    }

    render() {
        var sectionStyle = {
            width: "100%",
            height: "100%",
            backgroundImage: "url(" + Background + ")"
        }
        return (
    <Row >
                <Col s={3}></Col>
                <Col s={6} style={{ height: '500px', borderTop : 'none' }}>
                    
                    <form onSubmit={this.signup.bind(this)}>
                        <Input s={6} name='firstname' value={this.state.firstName} onChange={this._onChangeUserName} label="First Name" />
                        <Input s={6} label="Last Name" name='lastname' value={this.state.lastName} onChange={this._onChangLastName} />
                        <br />
                        <Input label='Email' s={12} type='text' name='email' value={this.state.email} title='type email here' onChange={this._onChangeEmail} />
                        <br />
                        <Input label='Password' s={12} type='password' name='password' title='type password here' value={this.state.password} onChange={this._onChangePassword} />
                        <br />
                        <Input label='Wallet Address' s={42} type='text' name='wallet' title='type wallet address here' value={this.state.wallet} onChange={this._onChangeWallet} />
                        <br />
                        <Row >
                            <Input s={6} type='select' label="Sign up as"  onChange={this._onChangeType}>
                            <option value="" disabled selected>Choose your option</option>
                                <option value='Tenant'>Tenant</option>
                                <option value='Landlord'>Landlord</option>
                                
                            </Input>
                        </Row>
                        
                        <Button className="btn waves-effect waves-light" type="submit" name="action" title='signup' style={{ display: 'block' }}>Signup</Button>
                        <Link to='/'>Already have an account?</Link>
                        <div><p style={{ color: "red" }}>{this.props.errorMsg}</p></div>
                    </form>
                    {
                        (this.props.progressBarDisplay) ? (
                            <Col s={12}>
                                <ProgressBar />
                            </Col>
                        ) :
                            <div></div>
                    }
                </Col>

                <Col s={3}></Col>
            </Row>
// </Modal>
            
        )
    }
}

function mapStateToProp(state) {
    return ({
        progressBarDisplay: state.root.progressBarDisplay,
        errorMsg: state.root.errorMessage,
        type:state.root.type
    })
}
function mapDispatchToProp(dispatch) {
    return ({
        signupwithEmailPassword: (userDetails) => {
            dispatch(signupAction(userDetails));
        },
        errorMessage: (message) => {
            dispatch(errorMessage(message));
        },
        typeChecker: (type) => {
            dispatch(typeCheck(type));
        }
    })
}

export default connect(mapStateToProp, mapDispatchToProp)(Signup);