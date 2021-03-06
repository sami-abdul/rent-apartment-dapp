import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible } from 'react-materialize'
import { fetchAllProfiles } from '../store/actions/action';
import img from "../images/building.png"
import img1 from "../images/requestImg.png"

const contract = require('truffle-contract')

import DataControllerContract from '../../build/contracts/DataController.json'
import getWeb3 from '../utils/getWeb3'

var dataControllerContract
var deployedInstance
var mAccounts

const factor = 100000000000000;

const imgStyle = {

    float: "left",
    height: "170px"
};

const imgStyle1 = {
    height: "100px",
    float: "left"
};

const balancesStyle = {
    float: "right"
};

const balanceStyle = {
    float: "right"
};
const backcolorR = {
    // background:"red"
    color: "red"
}

class Landlord extends Component {

    constructor(props) {
        super(props)

        this.state = {
            web3: null,
            data: [],
            requests: [],
            balance: 0,
            rentHistory: []
        }
        // this.editData=this.editData.bind(this);
    }

    submit(event) {
        // console.log( this.refs.cgpa.state.value, this.refs.cgpa.value)
        // console.log( this.refs.number.state.value, this.refs.number.value)
        // console.log( this.refs.field.state.value, this.refs.field.value)
        // console.log( this.refs.cgpa.state.value)
        event.preventDefault();
        if (this.refs.Apartmenthike.state.value === undefined || this.refs.price.state.value === undefined || this.refs.address.state.value === undefined) {
            alert("all the fields are required");
        }
        else if (this.refs.address.state.value.length > 32 || this.refs.name.state.value.length > 32) {
            alert("Address and Name must be less than 32 characters :");
        }

        else {
            let AppartmentInfo = {
                name: this.refs.name.state.value,
                address: this.refs.address.state.value,
                price: this.refs.price.state.value,
                Apartmenthike: this.refs.Apartmenthike.state.value

            }
            this.addApartment(AppartmentInfo)
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
                this.getData()
            })
        })
    }

    getData() {
        this.getApartment()
        this.getRequests()
        this.getBalance()
        this.getRentHistory()
    }

    getApartment() {
        deployedInstance.getApartments.call({ from: this.props.user.wallet })
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

                this.setState({
                    data: arr
                })
                console.log(arr)
            })
    }

    getRequests() {
        deployedInstance.getAllHireRequests.call({ from: this.props.user.wallet })
            .then((result) => {
                //console.log("Result: " + result)
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

                this.setState({
                    requests: arr
                })
            })
    }

    getBalance() {
        let bal = this.state.web3.fromWei(this.state.web3.eth.getBalance(this.props.user.wallet))
        this.setState({
            balance: bal.toNumber()
        })
    }

    addApartment(data) {
        let gasEstimate
        deployedInstance.addApartment.estimateGas(data.name, data.address, this.state.web3.toWei(data.price, 'ether'), data.Apartmenthike)
            .then((result) => {
                gasEstimate = result * 2
                console.log("Estimated gas to add an apartment: " + gasEstimate)
            })
            .then((result) => {
                deployedInstance.addApartment(data.name, data.address, this.state.web3.toWei(data.price, 'ether'), data.Apartmenthike, {
                    from: this.props.user.wallet,
                    gas: gasEstimate,
                    gasPrice: this.state.web3.eth.gasPrice
                })
            })
            .then((result) => {
                this.getData()
            })
    }

    editData(id) {
        let Apname = prompt("Enter Name");
        let Apaddress = prompt("Enter Adress");
        let Apprice = parseInt(prompt("Enter Price"));
        let Aphike = parseInt(prompt("Enter Hike"));
        let editedApartment = {
            name: Apname,
            address: Apaddress,
            price: Apprice,
            Apartmenthike: Aphike,
            id: id

        }
        // console.log(editedApartment)

        this.editApartment(editedApartment);
    }

    editApartment(data) {
        let gasEstimate
        console.log(data)
        deployedInstance.editApartment.estimateGas(data.id, data.name, data.address, data.price, data.Apartmenthike)
            .then((result) => {
                gasEstimate = result * 2
                // console.log("Estimated gas to edit an apartment: " + gasEstimate)
            })
            .then((result) => {
                deployedInstance.editApartment(data.id, data.name, data.address, data.price, data.Apartmenthike, {
                    from: this.props.user.wallet,
                    gas: gasEstimate,
                    gasPrice: this.state.web3.eth.gasPrice
                }
                )
            })
            .then(() => {
                this.getData()
            })
    }

    approveHireRequest(data) {
        deployedInstance.approveHireRequest(data.requestID, data.apartmentID, data.tenantID, {
            from: this.props.user.wallet,
            gas: 1000000,
            gasPrice: this.state.web3.eth.gasPrice
        }
        )
            .then(() => {
                this.getData()
            })
    }

    collectRent(apartmentID) {
        var tempData = null
        deployedInstance.getApartment.call(apartmentID, { from: this.props.user.wallet })
            .then((result) => {
                tempData = result
                var rent = this.state.web3.fromWei(tempData[5].c[0] * factor, 'ether') * (tempData[6].c[0] / 100 + 1)
                deployedInstance.collectRent(apartmentID, this.state.web3.toWei(rent, 'ether'), {
                    from: this.props.user.wallet,
                    gas: 1000000,
                    gasPrice: this.state.web3.eth.gasPrice
                })
                    .then((result) => {
                        console.log(result)
                        this.getData()
                    })
            })
    }

    acceptRequest(uniqueKeys, apartmetnID, tenantID) {
        console.log(uniqueKeys, apartmetnID, tenantID);
        let acceptRequestData = {
            requestID: uniqueKeys,
            apartmentID: apartmetnID,
            tenantID: tenantID
        }
        this.approveHireRequest(acceptRequestData);
    }

    getRentHistory() {
        deployedInstance.getRentHistory.call({ from: this.props.user.wallet })
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
                console.log("Rents: " + arr);
                this.setState({
                    rentHistory: arr
                })
            })
    }

    render() {
        return (
            <div>
                {/* <img src={require("building.png")} alt="Buildings" align="right" /> */}
                <Button style={balancesStyle} className="btn waves-effect waves-light" >Balance: {this.state.balance} ETH</Button>

                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Apartments" class="active" href="#test3">
                        <div>
                            {

                                this.state.data.map((apartment, ind) => {
                                    function hexToString(hex) {
                                        var string = '';
                                        for (var i = 0; i < hex.length; i += 2) {
                                            string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                                        }
                                        return string;
                                    }

                                    var partsArray = apartment.split(',');

                                    let apartmentString = hexToString(partsArray[1]);
                                    let apartmentAddress = hexToString(partsArray[3]);

                                    return (
                                        <Collapsible key={ind}  >
                                            <CollapsibleItem header={apartmentString} >
                                                <p>
                                                    <img src={img} alt="Buildings" style={imgStyle} />
                                                    <span>ID: </span> <span>{partsArray[0]}</span>
                                                    <br />
                                                    <span>Name: </span> <span>{apartmentString}</span>
                                                    <br />
                                                    <span>Tenant Address: </span> <span>{partsArray[2]}</span>
                                                    <br />
                                                    <span>Location: </span> <span>{apartmentAddress}</span>
                                                    <br />
                                                    <span>Rent: </span> <span>{this.state.web3.fromWei(partsArray[4], 'ether')} ETH</span>
                                                    {/* <span>Rent: </span> <span>{partsArray[4]}</span> */}
                                                    <br />
                                                    <span>Rent Hike Rate: </span> <span>{partsArray[5]}%</span>
                                                    <br />

                                                    {
                                                        (partsArray[2].includes("0x00")) ?
                                                            (<Button className="btn waves-effect waves-light" title='edit' style={{ display: 'block' }} onClick={() => { this.editData(partsArray[0]).bind(this) }}>EDIT</Button>)
                                                            : (<Button className="btn waves-effect waves-light" title='rent' style={{ display: 'block' }} onClick={() => { this.collectRent(partsArray[0]) }}>Collect Rent</Button>)
                                                    }
                                                </p>
                                            </CollapsibleItem>
                                        </Collapsible>
                                    )
                                })
                            }
                        </div>
                    </Tab>
                    {/* defaultValue={this.props.user.lastName} */}
                    <Tab title="Add Apartment " ><form onSubmit={this.submit.bind(this)}>
                        <Input s={12} label="Apartment Name" ref="name" />
                        <Input s={12} label="Apartment Location" ref="address" />
                        <Input type="number" s={6} label="Monthly Hike Rate (%)" ref="Apartmenthike" />
                        <Input type="number" s={6} label="Apartment Monthly Rent (ETH)" ref="price" /> <br />
                        <Button className="btn waves-effect waves-light" type="submit" name="action" title='submit' style={{ display: 'block' }}>Submit</Button>

                    </form></Tab>
                    <Tab title="Requests" >

                        {

                            this.state.requests.map((apartmentRequests, ind) => {

                                var partsRequestArray = apartmentRequests.split(',');

                                if (!partsRequestArray[0].includes("0x0000000")) {

                                    return (
                                        <Collapsible key={ind}>
                                            <CollapsibleItem header={partsRequestArray[0]}>
                                                <p>
                                                    <img src={img1} alt="Buildings" style={imgStyle1} />
                                                    <span>From: </span> <span>{partsRequestArray[1]}</span>
                                                    <br />
                                                    <span>Apartment ID: </span> <span>{partsRequestArray[2]}</span>
                                                    <br />
                                                    <Button className="btn waves-effect waves-light" type="submit" name="action" title='acceptRequest' style={{ display: 'block' }} onClick={() => { this.acceptRequest(partsRequestArray[0], partsRequestArray[2], partsRequestArray[1]).bind(this) }}>Accept Request</Button>
                                                </p>
                                            </CollapsibleItem>
                                        </Collapsible>
                                    )
                                }
                            })
                        }
                    </Tab>

                    <Tab title="Rent History" >
                    <div>
                            {
                             (this.state.rentHistory)?(
                                <div>
                                {
                                    this.state.rentHistory.map((apartment, ind) => {

                                        var partsArrayHistory = apartment.split(',');
                                        var date = new Date(partsArrayHistory[2] * 1000)
                                        var dateString = date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear()

                                        return (
                                            <Collapsible key={ind}  >
                                                <CollapsibleItem header={dateString} >
                                                    <p>

                                                        <span>From: </span> <span>{partsArrayHistory[0]}</span>
                                                        <br />
                                                        <span>Amount: </span> <span>{this.state.web3.fromWei(partsArrayHistory[1], 'ether')} ETH</span>
                                                        <br />
                                                        {/* <span>Date: </span> <span>{partsArrayHistory[2]}</span> */}
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
    return ({
        isLogin: state.root.isLogin,
        allUserData: state.root.allUserProfile,
        user: state.root.user,
        uid: state.root.userID,
    })
}

function mapDispatchToProp(dispatch) {
    return ({
        fetchAllProfiles: () => {
            dispatch(fetchAllProfiles())
        },
        // setCompanyProfileToFirebase: (companyData,userUid) => {
        //     dispatch(setCompanyProfileToFirebase(companyData,userUid))
        // }
    })
}

export default
    connect(mapStateToProp, mapDispatchToProp)(Landlord);