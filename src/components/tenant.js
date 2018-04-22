import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible } from 'react-materialize'
import { setUserProfileToFirebase } from '../store/actions/action';
import img from "../images/building.png"

const contract = require('truffle-contract')

import DataControllerContract from '../../build/contracts/DataController.json'
import getWeb3 from '../utils/getWeb3'

var dataControllerContract
var deployedInstance
var mAccounts

var currentApartment = []

const factor = 100000000000000;

const imgStyle = {
    float: "left",
    height: "170px"
};

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
            paymentHistory: null,
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
            this.getApartment(this.refs.search.state.value);
        }
    }

    hireApartment(data) {
        deployedInstance.hireApartment(data.apartment, data.owner, {
            from: this.props.user.wallet,
            gas: 1000000,
            gasPrice: this.state.web3.eth.gasPrice
        })
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
        if (currentApartment[7] == false) {
            deployedInstance.makePayment({
                from: this.props.user.wallet,
                value: this.state.web3.toWei(this.state.currentApartment[5].c[0] / 10000),
                gas: 1000000,
                gasPrice: this.state.web3.eth.gasPrice
            })
            .then((result) => {
                this.getData()
            })
        } else {
            window.alert('You have already paid rent for this month.')
        }
    }

    getData() {
        this.getBalance()
        this.getCurrentApartment()
    }

    getBalance() {
        let bal = this.state.web3.fromWei(this.state.web3.eth.getBalance(this.props.user.wallet))
        this.setState({
            balance: bal.toNumber()
        })
    }

    getApartment(apartmentId) {
        if (apartmentId !== undefined) {
            deployedInstance.getApartment.call(apartmentId, { from: this.props.user.wallet })
            .then((result) => {
                this.setState({
                    data: result
                })
                console.log(result);
            })
        }
    }

    getCurrentApartment() {
        deployedInstance.getCurrentApartment.call({ from: this.props.user.wallet })
            .then((result) => {
                currentApartment = result
                console.log(currentApartment);
                this.getPaymentHistory(currentApartment[0])
            })
    }

    getPaymentHistory(apartmentId) {
        if (apartmentId !== undefined) {
            deployedInstance.getPaymentHistory.call(apartmentId, { from: this.props.user.wallet })
                .then((result) => {
                    let count = 0
                    let nestedCount = 0
                    let arr = []
                    result.map((items) => {
                        count++
                        items.map((item) => {
                            if (count == 1) {
                                arr[nestedCount] = item
                            } else {
                                arr[nestedCount] += "," + item
                            }
                            nestedCount++
                        })
                        nestedCount = 0
                    })
                    console.log("Payment: " + arr);
                    this.setState({
                        currentApartment: currentApartment,
                        paymentHistory: arr
                    })
                })
        }
    }

    hire(AppartmentID, OwnerID) {
        if (currentApartment.length == 0) {
            let hireData = {
                apartment: AppartmentID,
                owner: OwnerID
            }
            this.hireApartment(hireData);
        } else {
            window.alert('You are already a tenant. You cannot hire more apartments')
        }
    }

    render() {
        return (
            <div>
                <Button style={balancesStyle} className="btn waves-effect waves-light" s={5} >Apartment Code: 123456</Button>
                <Button style={balancesStyle} className="btn waves-effect waves-light" s={12} >Balance: {this.state.balance} ETH</Button>
                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Search Apartment" className="active">
                        <form onSubmit={this.submit.bind(this)}>

                            <br />
                            <Input label="Search Appartment" ref="search" s={8} />
                            <Button style={divStyle} className="btn waves-effect waves-light" type="submit" name="action" title='Search' >Search</Button>
                            <br/>
                        </form>
                        <div>
                            {
                                (this.state.data) ? (
                                    //apatmentData :["Apartment ID","Apartment Name","Apartment Owner","Apartment Tenant", "Apartment Location","Apartment Rent Price","Apartment Hike Rate"],
                                    <p>
                                        
                                        <br />
                                        <img src={img} alt="Buildings" style={imgStyle} />
                                        ID: {this.state.data[0]}
                                        <br />
                                        Name: {this.state.data[1]}                                  
                                        <br />
                                        Owner: {this.state.data[2]}
                                        <br />
                                        Tenant: {this.state.data[3]}
                                        <br />
                                        Location: {this.state.data[4]}
                                        <br />
                                        Rent: {this.state.web3.fromWei(this.state.data[5].c[0] * factor, 'ether')} ETH
                                        <br />
                                        Hike Rate: {this.state.data[6].c[0]}
                                        <br />
                                        {(this.state.eventResult == "HireRequestReceived") ?
                                            (null) :
                                            (<Button className="btn waves-effect waves-light" onClick={() => { this.hire(this.state.data[0], this.state.data[2]).bind(this) }} >Hire Apartment</Button>)
                                        }

                                    </p>

                                ) : (
                                        null
                                    )
                            }
                        </div>


                    </Tab>

                    <Tab title="Current Apartment" >
                        <div>
                            {
                                (this.state.currentApartment) ? (
                                    //apatmentData :["Apartment ID","Apartment Name","Apartment Owner","Apartment Tenant", "Apartment Location","Apartment Rent Price","Apartment Hike Rate"],
                                    <div>
                                        <br />
                                        <img src={img} alt="Buildings" style={imgStyle} />
                                        Name: {this.state.currentApartment[1]}
                                        <br />
                                        ID: {this.state.currentApartment[0]}
                                        <br />
                                        Owner: {this.state.currentApartment[2]}
                                        <br />
                                        Tenant Address: {this.state.currentApartment[3]}
                                        <br />
                                        Location: {this.state.currentApartment[4]}
                                        <br />
                                        Rent: {this.state.currentApartment[5].c[0] / 10000} ETH
                                        <br />
                                        Rent Hike Rate: {this.state.currentApartment[6].c[0]}%
                                        <br />
                                        
                                    
                                        <Button className="btn waves-effect waves-light" onClick={() => { this.makePayment() }} >Pay Rent</Button>

{/* // {this.getPaymentHistory(this.state.currentApartment[0])} */}

                                    </div>

                                ) : (
                                        null
                                    )

                            }
                        </div>

                    </Tab>

                    <Tab title="Payment History"  >
                            <div>
                            {/* <Button className="btn waves-effect waves-light" onClick={() => { this.getPaymentHistory(this.state.currentApartment[0]) }}></Button> */}

                            {
                             (this.state.paymentHistory)?(
                                <div>
                                {
                                    this.state.paymentHistory.map((apartment, ind) => {

                                        var partsArrayHistory = apartment.split(',');
                                        var date = new Date(partsArrayHistory[2] * 1000)
                                        var dateString = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear()

                                        return (
                                            <Collapsible key={ind}  >
                                                <CollapsibleItem header={dateString} >
                                                    <p>

                                                        <span>To: </span> <span>{partsArrayHistory[0]}</span>
                                                        <br />
                                                        <span>Amount: </span> <span>{this.state.web3.fromWei(partsArrayHistory[1], 'ether')} ETH</span>
                                                        <br />
                                                        <span>Date: </span> <span>{dateString}</span>
                                                        <br />

                                                    </p>
                                                </CollapsibleItem>
                                            </Collapsible>
                                        )
                                    })
                                }
                            </div>

                            ):(null)
                            }
                            
                            </div>
                    </Tab>

                </Tabs>


            </div>
        )
    }
}

function mapStateToProp(state) {
//    console.log(state)
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