import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible } from 'react-materialize'
import { fetchAllProfiles } from '../store/actions/action';

const contract = require('truffle-contract')

import DataControllerContract from '../../build/contracts/DataController.json'
import getWeb3 from '../utils/getWeb3'

// import { setCompanyProfileToFirebase } from '../store/actions/action';



// import {
//     Link
//   } from 'react-router-dom';

var dataControllerContract
var deployedInstance
var mAccounts

class Landlord extends Component {

    constructor(props) {
        super(props)

        this.state = {
          web3: null,
          data: []
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
        else{
            let AppartmentInfo = {
                address : this.refs.address.state.value,
                price : this.refs.price.state.value,
                Apartmenthike : this.refs.Apartmenthike.state.value
            }
            this.addApartment(AppartmentInfo)
            // this.props.showNotification();
            //  this.props.setCompanyProfileToFirebase(CompanyInfo, this.props.uid)
        }
    }

    addApartment(data) {
        let gasEstimate
        deployedInstance.addApartment.estimateGas(data.address, data.AppartmentHike, data.price)
        .then((result) => {
            gasEstimate = result * 2
            console.log("Estimated gas to add an apartment: " + gasEstimate)
        })
        .then((result) => {
            deployedInstance.addApartment(
              data.address, 6, data.price, {
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
            console.log(result)
            console.log(this.state.data)
        })
    }

    render() {
        return (
            <div>
                <Tabs className='tab-demo z-depth-1'>
                    <Tab title="Apartments Data">
                        <div>
                            {
                                this.props.allUserData.map((user, ind) => {
                                    return (<Collapsible key={ind}>
                                        <CollapsibleItem header={user.firstName}>
                                            <span>Full Name : </span> <span>{user.firstName + ' '}{user.lastName}</span>
                                            <br />
                                            <span>CGPA : </span> <span>{user.cgpa}</span>
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
                    {/* defaultValue={this.props.user.lastName} */}
                    <Tab title="Add Apartment " ><form onSubmit = {this.submit.bind(this)}>
                        <Input s={12} label="Address" ref="address" />
                        <Input s={6} label="Hike rate" ref="Apartmenthike" />
                        <Input type="number" s={6} label="Rent" ref="price"/> <br/>
                        <Button className="btn waves-effect waves-light" type="submit" name="action" title = 'submit' style = {{display : 'block'}}>Submit</Button>

                    </form></Tab>

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