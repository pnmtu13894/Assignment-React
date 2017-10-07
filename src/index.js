import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';
import firebase from 'firebase';
import {BrowserRouter} from "react-router-dom";


// Initialize Firebase
const config = {
    apiKey: "AIzaSyA5g-h2YZPhFAbPDVscUEZHU_-5Vn9Qqs0",
    authDomain: "assignment2-react.firebaseapp.com",
    databaseURL: "https://assignment2-react.firebaseio.com",
    projectId: "assignment2-react",
    storageBucket: "assignment2-react.appspot.com",
    messagingSenderId: "239172531086"
};
firebase.initializeApp(config);

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
    , document.getElementById('root'));
registerServiceWorker();
