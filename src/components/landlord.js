import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible } from 'react-materialize'
import { fetchAllProfiles } from '../store/actions/action';
import img from "../images/building.png"

const contract = require('truffle-contract')

import DataControllerContract from '../../build/contracts/DataController.json'
import getWeb3 from '../utils/getWeb3'

var dataControllerContract
var deployedInstance
var mAccounts

const imgStyle = {
    
    float:"left",
    height:"170px"
};

class Landlord extends Component {

    constructor(props) {
        super(props)

        this.state = {
          web3: null,
          data: [],
          requests: [],
          balance: 0
        }
    }

    submit(event){
        // console.log( this.refs.cgpa.state.value, this.refs.cgpa.value)
        // console.log( this.refs.number.state.value, this.refs.number.value)
        // console.log( this.refs.field.state.value, this.refs.field.value)
        // console.log( this.refs.cgpa.state.value)
        event.preventDefault();
        if(   this.refs.Apartmenthike.state.value === undefined ||  this.refs.price.state.value === undefined || this.refs.address.state.value === undefined)
        {
            alert("all the fields are required");
        }
        else if(this.refs.address.state.value.length > 32 || this.refs.name.state.value.length > 32){
            alert("Address and Name must be less than 32 characters :");
        }
        
        else{
            let AppartmentInfo = {
                name:this.refs.name.state.value,
                address : this.refs.address.state.value,
                price : this.refs.price.state.value,
                Apartmenthike : this.refs.Apartmenthike.state.value
                
            }
            console.log(this.refs.address.state.value);
            // console.log(this.refs.name.state.value.length);
            this.addApartment(AppartmentInfo)
            // this.props.showNotification();
            //  this.props.setCompanyProfileToFirebase(CompanyInfo, this.props.uid)
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
    }

    getApartment() {
        deployedInstance.getApartments.call({ from: mAccounts[0] })
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
            console.log(this.state.data)
        })
    }

    getBalance() {
        deployedInstance.getBalance.call({ from: mAccounts[0] })
        .then((result) => {
            this.setState({
                balance: result.toNumber()
            })
            console.log(this.state.balance)
        })
    }

    createUser() {
        let gasEstimate
        deployedInstance.createUser.estimateGas("email", "wallet", true)
        .then((result) => {
            gasEstimate = result * 2
            console.log("Estimated gas to edit an apartment: " + gasEstimate)
        })
        .then((result) => {
            deployedInstance.createUser("email", "wallet", true, {
                  from: mAccounts[0],
                  gas: gasEstimate,
                  gasPrice: this.state.web3.eth.gasPrice
                }
            )
        })
        .then(() => {
            this.getData()
        })
    }

    addApartment(data) {
        let gasEstimate
        deployedInstance.addApartment.estimateGas(data.name, data.address, data.price, data.Apartmenthike)
        .then((result) => {
            gasEstimate = result * 2
            console.log("Estimated gas to add an apartment: " + gasEstimate)
        })
        .then((result) => {
            deployedInstance.addApartment(data.name, data.address, data.price, data.Apartmenthike, {
                  from: mAccounts[0],
                  gas: gasEstimate,
                  gasPrice: this.state.web3.eth.gasPrice
                }
            )
        })
        .then(() => {
            this.getData()
        })
    }

    editApartment(data) {
        let gasEstimate
        deployedInstance.editApartment.estimateGas("id", data.name, data.address, data.price, data.Apartmenthike)
        .then((result) => {
            gasEstimate = result * 2
            console.log("Estimated gas to edit an apartment: " + gasEstimate)
        })
        .then((result) => {
            deployedInstance.editApartment(data.name, data.address, data.price, data.Apartmenthike, {
                  from: mAccounts[0],
                  gas: gasEstimate,
                  gasPrice: this.state.web3.eth.gasPrice
                }
            )
        })
        .then(() => {
            this.getData()
        })
    }

    getRequests() {
        deployedInstance.getRequests.call({ from: mAccounts[0] })
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
            console.log(this.state.data)
        })
    }

    approveHireRequest(data) {
        let gasEstimate
        deployedInstance.approveHireRequest.estimateGas("request id", "apartment id", "tenant address")
        .then((result) => {
            gasEstimate = result * 2
            console.log("Estimated gas to approve hire request: " + gasEstimate)
        })
        .then((result) => {
            deployedInstance.approveHireRequest("request id", "apartment id", "tenant address", {
                  from: mAccounts[0],
                  gas: gasEstimate,
                  gasPrice: this.state.web3.eth.gasPrice
                }
            )
        })
        .then(() => {
            this.getData()
        })
    }

    render() {
        return (
            <div>
                {/* <img src={require("building.png")} alt="Buildings" align="right" /> */}
                
                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Apartments" className="active">
                        <div>
                            {

                                this.state.data.map((apartment, ind) => {
                                    function hexToString (hex) {
                                        var string = '';
                                        for (var i = 0; i < hex.length; i += 2) {
                                          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                                        }
                                        return string;
                                    }

                                    console.log(apartment, "apartment");
                                    console.log(ind, "ind");
                                    var partsArray = apartment.split(',');
                                    console.log(partsArray);

                                    let apartmentString = hexToString(partsArray[1]);
                                    let apartmentAddress = hexToString(partsArray[3]);
                                    console.log(apartmentString);
                                    
                                    return (
                                    <Collapsible key={ind}>
                                        <CollapsibleItem header={apartmentString}>
                                        <p>
                                        <img src={img} alt="Buildings" style={imgStyle} />      
                                            <span>Apartment Name: </span> <span>{apartmentString}</span>
                                            <br />
                                            <span>ID: </span> <span>{partsArray[0]}</span>
                                            <br />

                                            <span>Tenant Address: </span> <span>{partsArray[2]}</span>
                                            <br />
                                            <span>Location: </span> <span>{apartmentAddress}</span>
                                            <br />
                                            <span>Rent Price: </span> <span>{partsArray[4]}</span>
                                            <br />
                                            <span>Rent Hike Rate: </span> <span>{partsArray[5]}</span>
                                            </p>
                                        </CollapsibleItem>
                                    </Collapsible>
                                    )
                                })
                            }
                        </div>
                    </Tab>
                    {/* defaultValue={this.props.user.lastName} */}
                    <Tab title="Add Apartment " ><form onSubmit = {this.submit.bind(this)}>
                    <Input s={12} label="Apartment Name" ref="name" />
                        <Input s={12} label="Apartment Location" ref="address" />
                        <Input type="number" s={6} label="Monthly Hike Rate (%)" ref="Apartmenthike" />
                        <Input type="number" s={6} label="Apartment Monthly Rent (ETH)" ref="price"/> <br/>
                        <Button className="btn waves-effect waves-light" type="submit" name="action" title = 'submit' style = {{display : 'block'}}>Submit</Button>

                    </form></Tab>
                    <Tab title="Requests" >
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
        allUserData: state.root.allUserProfile,
        user: state.root.user,
        uid:state.root.userID,
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