import firebase from 'firebase';
import history from '../../history';


export function signinAction(user) {
    return dispatch => {
        dispatch({ type: "ERROR_MESSAGE", payload: '' })
        dispatch({ type: "SHOW_PROGRESS_BAR", payload: true })
        firebase.auth().signInWithEmailAndPassword(user.email, user.password)
            .then((signedinUser) => {
                let type;
                firebase.database().ref('users/' + signedinUser.uid).once('value', (snapshot) => {
                    type = snapshot.val().type;
                    dispatch({ type: 'USER', payload: snapshot.val()})
                    dispatch({ type: 'TYPE', payload : snapshot.val().type })
                    dispatch({ type: "CURRENT_USER_UID", payload: signedinUser.uid })
                dispatch({ type: "IS_LOGIN", payload: true })
                switch(type){
                    case 'Admin':
                    history.push('/admin');
                    break;
                    case 'Landlord':
                    history.push('/landlord');
                    break;
                    case 'Tenant':
                    history.push('/tenant');
                    break;
                }
                })
                
            })
            .catch((err) => {
                dispatch({ type: "SHOW_PROGRESS_BAR", payload: false })
                dispatch({ type: "ERROR_MESSAGE", payload: err.message })
            })
    }
}

export function signupAction(user) {

    
    return dispatch => {
        dispatch({ type: "ERROR_MESSAGE", payload: '' })
        dispatch({ type: "SHOW_PROGRESS_BAR", payload: true })
        dispatch({ type: 'USER_NAME', payload: user.firstName })
        
        firebase.database().ref('/').child('key/').once('value', (snapshot)=>{
            console.log(snapshot.val());
        }).then((snapshot)=>{
            var data = snapshot.val();
            let keysArray = [];
            // Loop to make objects into array
            for (var key in data){
                console.log(data[key])
                keysArray.push(data[key])
            }
            console.log(keysArray)
            let isKeyExists = true;
            //Now checking keys
            for(let i=0; i<keysArray.length; i++){
                if(keysArray[i] == user.wallet){
                    isKeyExists = false;
                }
            }

        if(isKeyExists){

            firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
            .then((createdUser) => {
//                console.log('signed up successfully', createdUser.uid);
//                console.log('type', user.type);
                delete user.password;
                user.uid=createdUser.uid;
                user.wallet = user.wallet;
                firebase.database().ref('users/' + user.uid + '/').set(user)
                    .then(() => {
                        firebase.database().ref('key/').push(user.wallet);
                        dispatch({ type: 'USER', payload: user})
                        dispatch({ type: 'CURRENT_USER_UID', payload: createdUser.uid })
                        dispatch({ type: "IS_LOGIN", payload: true })
                        dispatch({ type: "TYPE", payload: user.type })
                        switch(user.type){
                            case 'Landlord':
                            history.push('/landlord');
                            break;
                            case 'Tenant':
                            history.push('/tenant');
                            break;
                        }
                    })
            })
            .catch((err) => {
                dispatch({ type: "SHOW_PROGRESS_BAR", payload: false })
                dispatch({ type: "ERROR_MESSAGE", payload: err.message })
                console.log(err)
            })
    }
        else{
            alert('key exists')
        }
    })
}
}

// logout fn
export function logout() {
    return dispatch => {
        firebase.auth().signOut().then(function () {
            dispatch({ type: "SHOW_PROGRESS_BAR", payload: false })
            dispatch({ type: "IS_LOGIN", payload: false })
            // Sign-out successful.
            history.push('/');
        }, function (error) {
            // An error happened.
        });
    }
    
}



export function errorMessage(msg) {
    return dispatch => {
        dispatch({ type: 'ERROR_MESSAGE', payload: msg })
    }
}

export function typeCheck(type) {
    return dispatch => {
        dispatch({ type: 'TYPE', payload: type })
    }
}

// export function setUserProfileToFirebase(user, uid){
//     console.log(uid)
//     return dispatch => {
//     firebase.database().ref('userProfile/' + uid).set(user).then(() => {
//         dispatch({ type: 'SHOW_NOTIFICATION', payload: true })
//     })
// }
// }
export function setUserProfileToFirebase(user, uid) {
    return dispatch => {
        user.id=uid;
        firebase.database().ref('userProfile/' + uid).set(user).then(() => {
            dispatch({ type: 'asdasdasd', payload: true })
        }).then(() => {
            firebase.database().ref('users/' + uid).update({firstTime : false}).then(() => {
                dispatch({ type: 'ksmdkjasd', payload: true })
            })
        })
    }
}
export function setLandlordProfileToFirebase(ad, uid) {
    console.log(ad, uid);
    return dispatch => {
        ad.parentId = uid;
        let uniqueID = Math.random().toString(36).substr(2, 9);
        ad.id = uniqueID;
        firebase.database().ref('LandlordAds/' + uid + '/' + uniqueID).set(ad).then((snapshot) => {
            alert('ad posted Successfully !');
            dispatch({ type: 'ROUGH', payload: true })
        })
    }
}
// export function setLandlordProfileToFirebase(Landlord, uid){
//     console.log(uid)
//     let uniqueID = Math.random().toString(36).substr(2, 9);
//     return dispatch => {
//     firebase.database().ref('LandlordProfile/' + uid+'/'+uniqueID).set(Landlord).then(() => {
//         dispatch({ type: 'SHOW_NOTIFICATION', payload: true })
//     })
// }
// }

export function fetchAllProfiles() {
    return dispatch => {
        firebase.database().ref('userProfile').once('value', (snapshot) => {
            let allUsersProfile = [];
            for (var key in snapshot.val()) {
                allUsersProfile.push(snapshot.val()[key]);
            }
            dispatch({ type: 'ALL_USERS_PROFILE', payload: allUsersProfile })
        })
    }
}

export function fetchAllLandlordProfiles() {
    return dispatch => {
        firebase.database().ref('LandlordAds').once('value', (snapshot) => {
            console.log(snapshot.val())
            let allLandlordProfile = [];
            for (var key in snapshot.val()) {
                allLandlordProfile.push(snapshot.val()[key]);
            }
            let allLandlordProfiles = [];
            for(var i=0;i<allLandlordProfile.length;i++){
                for(var key in allLandlordProfile[i]){
                    allLandlordProfiles.push(allLandlordProfile[i][key]);
                }
            }
            console.log(allLandlordProfile)
            dispatch({ type: 'ALL_Landlord_PROFILE', payload: allLandlordProfiles })
        })
    }
}

export function DeleteUserProfiles(id) {
    console.log(id)
    return dispatch => {
        firebase.database().ref('userProfile/' + id).remove().then(() => {
            console.log('successful');
            firebase.database().ref('userProfile').once('value', (snapshot) => {
                console.log(snapshot.val())
                let allUsersProfile = [];
                for (var key in snapshot.val()) {
                    snapshot.val()[key].id = key;
                    allUsersProfile.push(snapshot.val()[key]);
                }
                dispatch({ type: 'ALL_USERS_PROFILE', payload: allUsersProfile })
            })
        })
        dispatch({ type: 'abcd', payload: true })
    }
}
export function DeleteLandlordProfiles(id,parentId){
    return dispatch => {
        firebase.database().ref('LandlordAds/' + parentId + '/' + id).remove().then(() => {
            console.log('successful');
            firebase.database().ref('LandlordAds').once('value', (snapshot) => {
                console.log(snapshot.val())
                let allAds = [];
                for (var key in snapshot.val()) {
                    allAds.push(snapshot.val()[key]);
                }
                console.log(allAds)
                let result = [];
                for (var i = 0; i < allAds.length; i++) {
                    for (var key in allAds[i]) {
                        result.push(allAds[i][key]);
                    }
                }
                console.log(result)
                dispatch({ type: 'ALL_Landlord_JOBS', payload: result })
            })
        })
        dispatch({ type: 'abcd', payload: true })
    }
}

// import firebase from 'firebase';
// import history from '../../history';


// export function signinAction(user) {
//     return dispatch => {
//         dispatch({ type: "ERROR_MESSAGE", payload: '' })
//         dispatch({ type: "SHOW_PROGRESS_BAR", payload: true })
//         firebase.auth().signInWithEmailAndPassword(user.email, user.password)
//             .then((signedinUser) => {
//                 firebase.database().ref('users/' + signedinUser.uid).once('value', (snapshot) => {
//                     dispatch({ type: 'USER_NAME', payload: snapshot.val().firstName })
//                 })
//                 dispatch({ type: "CURRENT_USER_UID", payload: signedinUser.uid })
//                 dispatch({ type: "IS_LOGIN", payload: true })
//                 history.push('/home');
//             })
//             .catch((err) => {
//                 dispatch({ type: "SHOW_PROGRESS_BAR", payload: false })
//                 dispatch({ type: "ERROR_MESSAGE", payload: err.message })
//             })
//     }
// }

// export function signupAction(user) {
//     return dispatch => {
//         dispatch({ type: "ERROR_MESSAGE", payload: '' })
//         dispatch({ type: "SHOW_PROGRESS_BAR", payload: true })
//         dispatch({ type: 'USER_NAME', payload: user.firstName })
//         firebase.auth().createUserWithEmailAndPassword(user.email, user.password)
//             .then((createdUser) => {
//                 console.log('signed up successfully', createdUser.uid);
//                 delete user.password;
//                 user.uid = createdUser.uid;
//                 firebase.database().ref('users/' + createdUser.uid + '/').set(user)
//                     .then(() => {
//                         dispatch({ type: 'CURRENT_USER_UID', payload: createdUser.uid })
//                         dispatch({ type: "IS_LOGIN", payload: true })
//                         history.push('/home');
//                     })
//             })
//             .catch((err) => {
//                 dispatch({ type: "SHOW_PROGRESS_BAR", payload: false })
//                 dispatch({ type: "ERROR_MESSAGE", payload: err.message })
//                 console.log(err)
//             })
//     }
// }

// // logout fn
// export function logout() {
//     return dispatch => {
//         firebase.auth().signOut().then(function () {
//             dispatch({ type: "SHOW_PROGRESS_BAR", payload: false })
//             dispatch({ type: "IS_LOGIN", payload: false })
//             // Sign-out successful.
//             history.push('/signin');
//         }, function (error) {
//             // An error happened.
//         });
//     }
    
// }



// export function errorMessage(msg) {
//     return dispatch => {
//         dispatch({ type: 'ERROR_MESSAGE', payload: msg })
//     }
// }

// export function typeCheck(type) {
//     return dispatch => {
//         dispatch({ type: 'TYPE', payload: type })
//     }
// }