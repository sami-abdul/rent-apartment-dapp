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
            currentApartment: null,
            eventResult: null
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
            this.getData();
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
                console.log("before Result state", this.state.eventResult);
                this.setState({
                    eventResult: result.logs[0].event,
                })
                console.log("after Result state", this.state.eventResult);
                this.getData()
            })
    }

    makePayment() {
        // let gasEstimate
        // deployedInstance.makePayment.estimateGas()
        //     .then((result) => {
        //         gasEstimate = result * 2
        //         console.log("Estimated gas to make payment: " + gasEstimate)
        //     })
            // .then((result) => {
                deployedInstance.makePayment({
                    from: this.props.user.wallet,
                    value: this.state.currentApartment.rentPrice,
                    gas: 1000000,
                    gasPrice: this.state.web3.eth.gasPrice
                })
            // })
            .then((result) => {
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

    getData() {
        //this.getApartment(apartmentId)
        // this.getPaymentHistory(apartmentId)
        this.getBalance()
        this.getCurrentApartment()
    }

    getApartment(apartmentId) {
        deployedInstance.getApartment.call(apartmentId, { from: this.props.user.wallet })
            .then((result) => {
                this.setState({
                    data: result
                })
                console.log(result);
            })
    }

    getCurrentApartment() {
        deployedInstance.getCurrentApartment.call({ from: this.props.user.wallet })
            .then((result) => {
                this.setState({
                    currentApartment: result
                })
                console.log(result);
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
                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Search Apartment" className="active">
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
                                        {(this.state.eventResult == "HireRequestReceived") ?
                                            (null) :
                                            (<Button className="btn waves-effect waves-light" onClick={() => { this.hire(this.state.data[0], this.state.data[2]).bind(this) }} >Hire Apartment</Button>)
                                        }


                                    </div>


                                ) : (
                                        null
                                    )

                            }
                        </div>


                    </Tab>




                    <Tab title="Current Apartment" className="active">
                        <div>

                            {

                                (this.state.currentApartment) ? (
                                    //apatmentData :["Apartment ID","Apartment Name","Apartment Owner","Apartment Tenant", "Apartment Location","Apartment Rent Price","Apartment Hike Rate"],
                                    <div>
                                        <br />
                                        Apartment Name: {this.state.currentApartment[1]}
                                        <br />
                                        Apartment ID: {this.state.currentApartment[0]}
                                        <br />
                                        Apartment Owner: {this.state.currentApartment[2]}
                                        <br />
                                        Apartment Tenant: {this.state.currentApartment[3]}
                                        <br />
                                        Apartment Location: {this.state.currentApartment[4]}
                                        <br />
                                        Apartment Rent Price: {this.state.currentApartment[5].c[0]}
                                        <br />
                                        Apartment Hike Rate: {this.state.currentApartment[6].c[0]}
                                        <br />

                                        <Button className="btn waves-effect waves-light" onClick={() => { this.makePayment() }} >Pay Rent</Button>



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

                    </Tab>

                    <Tab title="Payment History" className="active">
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