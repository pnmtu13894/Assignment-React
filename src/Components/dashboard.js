import React, {Component} from 'react';
import {Row, Grid, Col, Jumbotron} from 'react-bootstrap';
import Helpdesk from './SubComponents/Helpdesk';
import Technician from './SubComponents/Technician';


class Dashboard extends Component {



    render(){



        return(

            <div>
                <Grid>
                    <Row className="show-grid">
                        <Col md={3}>
                            <Jumbotron>
                                <h2>{this.props.type=== 'helpdesk' ? 'Helpdesk' : this.props.type === 'tech' ? 'Technician' : null}</h2>
                                <img src={this.props.user.photoURL} className="img-responsive img-circle" style={{padding: 20}} />
                                <h4>Hello</h4>
                                <h3>{this.props.user.displayName}</h3>
                            </Jumbotron>
                        </Col>
                        <Col md={9}>
                            {this.props.type === 'helpdesk' ? (
                                <Helpdesk/>
                            ) : this.props.type === 'tech' ? (
                                <Technician user={this.props.user} />
                            ) : null
                            }
                        </Col>
                    </Row>
                </Grid>
            </div>

        );
    }

}

export default Dashboard;