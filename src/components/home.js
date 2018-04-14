import React, { Component } from 'react';
import { connect } from 'react-redux';
// import {
//     Link
//   } from 'react-router-dom';

class Home extends Component {

    render() {
        return (
            <div>Home</div>
        )
    }
}

function mapStateToProp(state) {
    console.log(state)
    return ({
        isLogin : state.root.isLogin
    })
}


// function mapDispatchToProp(dispatch) {
//     return ({
//         logoutUser: () => {
//             dispatch(logout())
//         }
//     })
// }

export default 
connect(mapStateToProp, null)(Home);