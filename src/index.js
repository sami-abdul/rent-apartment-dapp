import React from 'react';
import ReactDOM from 'react-dom';
import BasicRouting from './config/routes';
import registerServiceWorker from './registerServiceWorker';
import {Provider} from 'react-redux';
import store from './store';
import firebase from 'firebase'

var config = {
  apiKey: "AIzaSyDH32991nn_rOMIrbAPdzzjCx7hGWQHeQY",
  authDomain: "hackathon1st-64cbd.firebaseapp.com",
  databaseURL: "https://hackathon1st-64cbd.firebaseio.com",
  projectId: "hackathon1st-64cbd",
  storageBucket: "",
  messagingSenderId: "1773010402"
};
firebase.initializeApp(config);

ReactDOM.render( <Provider store={store}>
    <BasicRouting />
  </Provider>, document.getElementById('root'));
registerServiceWorker();