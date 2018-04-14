import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible } from 'react-materialize'
import { fetchAllProfiles } from '../store/actions/action';
// import { setCompanyProfileToFirebase } from '../store/actions/action';



// import {
//     Link
//   } from 'react-router-dom';

class Landlord extends Component {
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
            console.log(AppartmentInfo);
            // this.props.showNotification();
            //  this.props.setCompanyProfileToFirebase(CompanyInfo, this.props.uid)
        }
    }
    componentWillMount() {
        this.props.fetchAllProfiles();
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
                        <Input s={12} label="Appartment Address" ref="address" />
                        <Input s={6} label="Appartment hike" ref="Apartmenthike" />
                        <Input type="number" s={6} label="Landlord Contact" ref="price"/> <br/>
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