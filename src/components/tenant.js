import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible } from 'react-materialize'
import { setUserProfileToFirebase } from '../store/actions/action';

const contract = require('truffle-contract')

import DataControllerContract from '../../build/contracts/DataController.json'
import getWeb3 from '../utils/getWeb3'

var dataControllerContract
var deployedInstance
var mAccounts

const divStyle = {
    marginTop: "20px"
};

const balancesStyle = {
    float: "right"
};

const balanceStyle = {
    float: "right"
};

class Tenant extends Component {

    constructor(props) {
        super(props)

        this.state = {
            web3: null,
            data: null,
            paymentHistory: [],
            apatmentData: ["Apartment ID", "Apartment Name", "Apartment Owner", "Apartment Tenant", "Apartment Location", "Apartment Rent Price", "Apartment Hike Rate"],
            index: 0,
            balance: 0,
            eventResult:null
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
    }

    instantiateContract() {
        dataControllerContract = contract(DataControllerContract)
        dataControllerContract.setProvider(this.state.web3.currentProvider)

        this.state.web3.eth.getAccounts((error, accounts) => {
            dataControllerContract.deployed().then((instance) => {
                deployedInstance = instance
                mAccounts = accounts
                this.getData();
            })
        })
    }

    submit(event) {
        event.preventDefault();
        if (this.refs.search.state.value === undefined) {
            alert("TextBox is Empty");
        }
        else {
            let appartment = {
                appart: this.refs.search.state.value,
            }
            console.log(this.refs.search.state.value);
            console.log(typeof this.refs.search.state.value);
            this.getData(this.refs.search.state.value);
            this.getApartment(this.refs.search.state.value);
        }
    }

    hireApartment(data) {
        let gasEstimate
        // deployedInstance.hireApartment.estimateGas(data.apartment, data.owner)
        // .then((result) => {
        //     gasEstimate = result * 2
        //     console.log("Estimated gas to edit an apartment: " + gasEstimate)
        // })
        // .then((result) => {
            deployedInstance.hireApartment(data.apartment, data.owner, {
                  from: this.props.user.wallet,
                  gas: 1000000,
                  gasPrice: this.state.web3.eth.gasPrice
                }
            )
        // })
        .then((result) => {
            console.log(result.logs[0].event)
            console.log("before Result state",this.state.eventResult);
            this.setState({
                eventResult: result.logs[0].event,
            })
            console.log("after Result state",this.state.eventResult);
            this.getData()
        })
    }

    getBalance() {
        let bal = this.state.web3.fromWei(this.state.web3.eth.getBalance(this.props.user.wallet))
        this.setState({
            balance: bal.toNumber()
        })
        console.log("Bal: " + this.state.balance)
    }

    getData(apartmentId) {
        //this.getApartment(apartmentId)
        // this.getPaymentHistory(apartmentId)
        this.getBalance()
    }

    getApartment(apartmentId) {
        deployedInstance.getApartment.call(apartmentId, { from: this.props.user.wallet })
            .then((result) => {
                this.setState({
                    data: result
                })
                console.log(result);
                console.log(this.state.data);
            })
    }

    getPaymentHistory(apartmentId) {
        deployedInstance.getPaymentHistory.call(apartmentId, { from: this.props.user.wallet })
            .then((result) => {
                this.setState({
                    paymentHistory: result
                })
                console.log(result);
                console.log(this.state.data);
            })
    }

    hire(AppartmentID, OwnerID) {
        console.log(AppartmentID, OwnerID);
        let hireData = {
            apartment: AppartmentID,
            owner: OwnerID
        }
        this.hireApartment(hireData);
    }

    render() {
        return (
            <div>
                <Button style={balancesStyle} className="btn waves-effect waves-light" s={12} >Balance: {this.state.balance} ETH</Button>
                0x055007910605ae214de6e12c806849d1e7aabd7ae019b8dced00a7226286b554
                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Appartments" className="active">
                        <form onSubmit={this.submit.bind(this)}>


                            <br />
                            <Input label="Search Appartment" ref="search" s={8} />
                            <Button style={divStyle} className="btn waves-effect waves-light" type="submit" name="action" title='Search' >Search</Button>

                        </form>
                        <div>

                            {

                                (this.state.data) ? (
                                    //apatmentData :["Apartment ID","Apartment Name","Apartment Owner","Apartment Tenant", "Apartment Location","Apartment Rent Price","Apartment Hike Rate"],
                                    <div>
                                        <br />
                                        Apartment Name: {this.state.data[1]}
                                        <br />
                                        Apartment ID: {this.state.data[0]}
                                        <br />
                                        Apartment Owner: {this.state.data[2]}
                                        <br />
                                        Apartment Tenant: {this.state.data[3]}
                                        <br />
                                        Apartment Location: {this.state.data[4]}
                                        <br />
                                        Apartment Rent Price: {this.state.data[5].c[0]}
                                        <br />
                                        Apartment Hike Rate: {this.state.data[6].c[0]}
                                        <br />
                                        {(this.state.eventResult=="HireRequestReceived")?
                                        (null):
                                        (<Button className="btn waves-effect waves-light" onClick={() => { this.hire(this.state.data[0], this.state.data[2]).bind(this) }} >Hire Apartment</Button>)
                                        }
                                        

                                    </div>
                                    //  this.state.data.map((apartment, ind) => {
                                    //  console.log(apartment);
                                    //      <p key={ind}>

                                    // <div>{apartment}</div>
                                    // <br/>      

                                    // </p>
                                    //  })

                                ) : (
                                        null
                                    )

                            }
                        </div>

                        {/* {(this.props.user.firstTime) ? (
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
                                </div>)} */}
                    </Tab>


                    {/* <Tab title="Companies Data" >
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
                    </Tab> */}

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