import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible } from 'react-materialize'
import { setUserProfileToFirebase } from '../store/actions/action';

const contract = require('truffle-contract')

import DataControllerContract from '../../build/contracts/DataController.json'
import getWeb3 from '../utils/getWeb3'

// import { fetchAllCompanyProfiles } from '../store/actions/action';
// import {
//     Link
//   } from 'react-router-dom';

var dataControllerContract
var deployedInstance
var mAccounts

class Tenant extends Component {

    constructor(props) {
        super(props)

        this.state = {
            web3: null,
            data: null
        }
    }

    componentWillMount() {
        getWeb3
        .then(results => {
            this.setState({
                web3: results.web3
            })
            this.instantiateContract()
        })
        .catch(() => {
            console.log('Error finding web3.')
        })

        this.props.fetchAllProfiles();
    }

    instantiateContract() {
        dataControllerContract = contract(DataControllerContract)
        dataControllerContract.setProvider(this.state.web3.currentProvider)

        this.state.web3.eth.getAccounts((error, accounts) => {
            dataControllerContract.deployed().then((instance) => {
                deployedInstance = instance
                mAccounts = accounts
            })
        })
    }

    submit(event) {
        // console.log( this.refs.cgpa.state.value, this.refs.cgpa.value)
        // console.log( this.refs.number.state.value, this.refs.number.value)
        // console.log( this.refs.field.state.value, this.refs.field.value)
        // console.log( this.refs.cgpa.state.value)
        event.preventDefault();
        if (this.refs.cgpa.state.value === undefined || this.refs.number.state.value === undefined || this.refs.field.state.value === undefined || this.refs.experience.state.value === undefined) {
            alert("all the fields are required");
        }
        else {
            let userInfo = {
                firstName: this.props.user.firstName,
                lastName: this.props.user.lastName,

                cgpa: this.refs.cgpa.state.value,
                number: this.refs.number.state.value,
                field: this.refs.field.state.value,
                exp: this.refs.experience.state.value
            }
            console.log(userInfo);
            // this.props.showNotification();
            this.props.setUserProfileToFirebase(userInfo, this.props.uid)
        }
    }
    // componentWillMount() {
    //     this.props.fetchAllCompanyProfiles();
    // }

    getData(apartmentId) {
        deployedInstance.getApartment.call(apartmentId, { from: mAccounts[1] })
        .then((result) => {
            console.log(result)
        })
    }

    render() {
        return (
            <div>
                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Profile">
                        {(this.props.user.firstTime) ? (
                            <form onSubmit={this.submit.bind(this)}>
                                <Input s={6} label="First Name" defaultValue={this.props.user.firstName} disabled />
                                <Input s={6} label="Last Name" defaultValue={this.props.user.lastName} disabled />
                                <Input label="Field" ref="field" s={6} />
                                <Input s={6} label="CGPA" ref="cgpa" />
                                <Input type="number" s={6} label="Number" ref="number" />
                                <Input s={6} label="Experience" ref="experience" />
                                <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block' }}>Submit</Button>

                            </form>) :
                            (
                                <div>
                                    <h4><span>Full Name : </span></h4> <h4><span>{this.props.user.firstName + ' '}{this.props.user.lastName}</span></h4>
                                    <br />


                                    <h4><span>Field : </span> <span>{this.props.user.field}</span></h4>
                                    <br />
                                    <h4><span>Contact Number : </span> <span>{this.props.user.number}</span></h4>
                                    <br />
                                    <h4><span>Experience : </span> <span>{this.props.user.exp}</span></h4>
                                </div>)}
                    </Tab>
                    <Tab title="Companies Data" >
                    <div>
                        {
                            this.props.allCompanyData.map((user, ind) => {
                                return (<Collapsible popout key={ind}>
                                    <CollapsibleItem header={user.firstName}>
                                        <span>Full Name : </span> <span>{user.firstName + ' '}{user.lastName}</span>
                                        <br />


                                        <span>Field : </span> <span>{user.field}</span>
                                        <br />
                                        <span>Contact Number : </span> <span>{user.number}</span>
                                        <br />
                                        <span>Experience : </span> <span>{user.exp}</span>

                                    </CollapsibleItem>
                                </Collapsible>)
                            })
                        }
                    </div>
                    </Tab>

                </Tabs>

            </div>
        )
    }
}

function mapStateToProp(state) {
    console.log(state)
    return ({
        isLogin: state.root.isLogin,
        user: state.root.user,
        uid: state.root.userID,
        allCompanyData: state.root.allCompanyProfile,
    })
}


function mapDispatchToProp(dispatch) {
    return ({
        setUserProfileToFirebase: (userData, userUid) => {
            dispatch(setUserProfileToFirebase(userData, userUid))
        },
        // fetchAllCompanyProfiles: () => {
        //     dispatch(fetchAllCompanyProfiles())
        // }
    })
}

export default connect(mapStateToProp, mapDispatchToProp)(Tenant);