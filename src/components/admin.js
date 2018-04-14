import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Input, Icon, Row, Tab, Tabs, Button, CollapsibleItem, Collapsible,Col } from 'react-materialize'
// import { fetchAllCompanyProfiles } from '../store/actions/action';
// import { fetchAllProfiles , DeleteUserProfiles,DeleteCompanyProfiles} from '../store/actions/action';



// import {
//     Link
//   } from 'react-router-dom';

class Admin extends Component {
    componentWillMount() {
        this.props.fetchAllCompanyProfiles();
        this.props.fetchAllProfiles();
    }
    deleteUser(uid){
        //console.log(uid,"in admin");
        this.props.DeleteUserProfiles(uid);
    }
    deleteCompany(uid,parentUid){
        console.log(uid,"in admin");
        this.props.DeleteCompanyProfiles(uid,parentUid);
    }

    render() {
        return (
            <div><Tabs className='tab-demo z-depth-1'>
                <Tab title="Companies Data">
                    <div>
                        {
                            this.props.allCompanyData.map((user, ind) => {
                                return (<Row>
                                    <Col s={10}>
                                    <Collapsible key={ind}>
                                        <CollapsibleItem header={user.firstName} >
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
                                    </Collapsible>
                                    </Col>
                                    <Col s={2}>
                                    <Button onClick={this.deleteCompany.bind(this,user.id,user.parentId)} className="waves-effect waves-light btn red accent-4" style={{marginTop:"10px"}}>DELETE</Button>
                                    </Col>
                                </Row>)
                            })
                        }
                    </div>
                </Tab>
                <Tab title="Students Data" >
                    <div>
                        {
                            this.props.allUserData.map((user, ind) => {
                                return (
                                <Row>
                                    <Col s={10}>
                                    <Collapsible key={ind}>
                                        <CollapsibleItem header={user.firstName} >
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
                                    </Collapsible>
                                    </Col>
                                    <Col s={2}>
                                    <Button onClick={this.deleteUser.bind(this,user.id)} className="waves-effect waves-light btn red accent-4" style={{marginTop:"10px"}}>DELETE</Button>
                                    </Col>
                                </Row>
                            )})
                        }
                    </div>
                </Tab>

            </Tabs></div>
        )
    }
}

function mapStateToProp(state) {
    console.log(state)
    return ({
        isLogin: state.root.isLogin,
        allCompanyData: state.root.allCompanyProfile,
        allUserData: state.root.allUserProfile,

    })
}


// function mapDispatchToProp(dispatch) {
//     return ({
//         fetchAllCompanyProfiles: () => {
//             dispatch(fetchAllCompanyProfiles())
//         },
//         fetchAllProfiles: () => {
//             dispatch(fetchAllProfiles())
//         },
//         DeleteUserProfiles: (uid) => {
//             dispatch(DeleteUserProfiles(uid))
//         },
//         DeleteCompanyProfiles: (uid,parentUid) => {
//             dispatch(DeleteCompanyProfiles(uid,parentUid))
//         },
//     })
// }

// export default
//     connect(mapStateToProp, mapDispatchToProp)(Admin);
export default Admin;