import React from 'react';
import ReactDOM from 'react-dom';
import BasicRouting from './config/routes';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import store from './store';
import firebase from 'firebase'

var config = {
    apiKey: "AIzaSyAsHqtj7E9h4JM1C1gcpB5RZK_sxojER78",
    authDomain: "rent-apartment-dapp.firebaseapp.com",
    databaseURL: "https://rent-apartment-dapp.firebaseio.com",
    projectId: "rent-apartment-dapp",
    storageBucket: "",
    messagingSenderId: "396001981856"
  };

//var config = {
//  apiKey: "AIzaSyCuXOJcskkV5oMZ5B8dQPIPbqtY4ljZ6Js",
//  authDomain: "rent-appartment.firebaseapp.com",
//  databaseURL: "https://rent-appartment.firebaseio.com",
//  projectId: "rent-appartment",
//  storageBucket: "",
//  messagingSenderId: "1090151029505"
//};

firebase.initializeApp(config);

ReactDOM.render( <Provider store={store}>
    <BasicRouting />
  </Provider>, document.getElementById('root'));
registerServiceWorker();