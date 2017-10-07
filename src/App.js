import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import firebase from 'firebase';
import Dashboard from './Components/dashboard';
import {Navbar, Button, Nav, NavItem, Jumbotron} from 'react-bootstrap';
import {Route, Redirect} from 'react-router';


class App extends Component {

    constructor(props){
        super(props);
        this.state = {
            type: null,
            user: null
        }
    }

    componentWillMount(){

        firebase.auth().onAuthStateChanged(this.handleCredentials);

    }

    componentWillUnmount(){
        if(this.state.user !== null){
            localStorage.setItem('type', this.state.type);
        }
    }

    handleClick = (type) => {
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithPopup(provider)
          .then((success) => {this.handleCredentials(success.user)})
          .then(() => {this.handleLogin(type)});
    };

    handleCredentials = (params) => {

        console.log(params);
        this.setState({
            user: params,
            type: localStorage.getItem('type')
        });

    };

    handleLogin = (type) => {

        localStorage.setItem('type', type);
        this.setState({
           type: type
        });

        const user={};
        user['user/' + this.state.user.uid] = {

            type: type,
            name: this.state.user.displayName,
            id: this.state.user.uid

        };
        firebase.database().ref().update(user);
    };

    handleSignout = () => {

        this.setState({
            user: null,
            type: null
        })

        localStorage.setItem('type', null);
        firebase.auth().signOut()
            .then(() => {
                alert('You have been signed out.');
            });

    };



    render(){
        return(

            <div className="App">

                <Navbar inverse>
                    <Navbar.Header>
                        <Navbar.Brand>
                            <a href="#" >Ticket System</a>
                        </Navbar.Brand>
                    </Navbar.Header>

                    <Nav pullRight>
                        {this.state.user !== null &&
                        <NavItem onClick={this.handleSignout}>
                            Sign out
                        </NavItem>
                        }
                    </Nav>
                </Navbar>

                <div className="container" >
                    <Route exact path="/" render={() => (
                        this.state.user === null ? (
                            <Jumbotron className="text-center">
                                <img src={logo} className="App-logo" alt="logo" style={{width: 200}} />
                                <h1>Sign in to continue</h1>
                                <p>
                                    Please select your account type:
                                </p>
                                <div className="text-center" >

                                    <Button bsSize="large" bsStyle="primary" style={{marginRight: 10}} onClick={() => this.handleClick('helpdesk')} >Helpdesk User</Button>
                                    <Button bsSize="large" bsStyle="success" onClick={() => this.handleClick('tech')} >Technician User</Button>
                                </div>
                            </Jumbotron>
                        ) : (
                            <Redirect to="/dashboard" />
                        )
                    )} />
                </div>

                <Route exact path="/dashboard" render={() => (

                    this.state.user !== null ? (

                        <Dashboard user={this.state.user} type={this.state.type} />

                    ) : (
                        <Redirect to="/" />
                    )

                )} />

                <footer className="footer navbar-bottom bg-primary text-white" style={{marginTop: 50, height: 50}}>

                    <h3>
                        Assignment 2 of Tu Pham-My Nguyen(s3575820-s3596903)
                    </h3>

                </footer>

            </div>

        );
    }

}

export default App;
