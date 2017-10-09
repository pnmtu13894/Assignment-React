import React, {Component} from 'react';
import {URL_API, convertHTMLTag, PRIORITY_LEVEL_LIST, ESCALATION_LEVEL_LIST} from "../../FileHelpers/helper";
import {Row, Col, Jumbotron, Button} from 'react-bootstrap';
import firebase from 'firebase';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class Helpdesk extends Component {


    constructor(props){
        super(props);


        this.state = {
            tickets: [], // array to contain retrieved ticket from the api
            reAssignedTickets: [], // array to contain reassigned tickets
            selectedTicket: null, // value that instantly hold the current selected ticket
            selectedAssignedTicket: null, // value that instantly hold the current selected assigned ticket
            selectedPriorityLevel: null, // value that instantly hold the current selected priority level
            selectedEscalationLevel: null, // value that instantly hold the escalation level
            selectedTech: null, // value that instantly
        };

        this.handleTechChange = this.handleTechChange.bind(this); //Handle changes chosen technician from input
        this.assignTicketToTech = this.assignTicketToTech.bind(this); // handle the assign/submit button from modal and also push data into database
        this.reassignTicketToTech = this.reassignTicketToTech.bind(this); // handle the reassigned Tickets and push data back to database.
        this.handleCloseDialog = this.handleCloseDialog.bind(this); // handle dialog's closing button from Pending Tickets part
        this.handleCloseDialog2 = this.handleCloseDialog2.bind(this); // handle dialog's closing button from Reassigned Tickets part
        this.ticketDetailsClick = this.ticketDetailsClick.bind(this); // handle the More Details Button to open the details box
        this.handlePriorityLevelChange = this.handlePriorityLevelChange.bind(this); // handle changes of priority level inputs
        this.handleEscalationLevelChange = this.handleEscalationLevelChange.bind(this); // handle changes of escalation level inputs
        this.handleEditClick = this.handleEditClick.bind(this); // creating component Button and handling click to retrieve data from specific row/cell of table and pass it to Details box

    }



    handlePriorityLevelChange(priorityLevel) {
        this.setState({
           selectedPriorityLevel: priorityLevel
        });
        console.log(this.state.selectedPriorityLevel);
    }

    handleEscalationLevelChange(escalationLevel){
        this.setState({
           selectedEscalationLevel: escalationLevel
        });
    }

    assignedTicketDetailsClick(assignedTicket){
        this.setState({
            selectedAssignedTicket: (this.state.selectedAssignedTicket !== null && this.state.selectedAssignedTicket.id === assignedTicket.id ? null : assignedTicket)
        });
    }

    ticketDetailsClick(ticket) {
        this.setState({
            selectedTicket: (this.state.selectedTicket !== null && this.state.selectedTicket.id === ticket.id ? null : ticket),
        });
    }

    handleCloseDialog(){
        this.setState({
           selectedTicket: null
        });
    }

    handleCloseDialog2(){
        this.setState({
           selectedAssignedTicket: null
        });
    }

    handleTechChange(techUser){
        this.setState({
           selectedTech: techUser,
        });
    }

    assignTicketToTech(){
        if(this.state.selectedTech === null && this.state.selectedPriorityLevel === null && this.state.selectedEscalationLevel === null) {
            alert('Please select the technician|Priority level|Escalation level to assign!!!');
            return;
        }

        const data = {};
        data['ticket/' + this.state.selectedTicket.id] = {
          ticket_id: this.state.selectedTicket.id,
          user_id: this.state.selectedTech,
            priority_level: this.state.selectedPriorityLevel,
            escalation_level: this.state.selectedEscalationLevel,
            isEscalated: false
        };

        firebase.database().ref().update(data);
        alert('Successfully assigned Technician to ticket!');
        window.location.reload();
    }

    reassignTicketToTech(){
        if(this.state.selectedTech === null && this.state.selectedPriorityLevel === null && this.state.selectedEscalationLevel === null) {
            alert('Please select the technician|Priority level|Escalation level to assign!!!');
            return;
        }

        const data = {};
        data['ticket/' + this.state.selectedAssignedTicket.id] = {
            ticket_id: this.state.selectedAssignedTicket.id,
            user_id: this.state.selectedTech,
            priority_level: this.state.selectedPriorityLevel,
            escalation_level: this.state.selectedEscalationLevel,
            isEscalated: false
        };

        firebase.database().ref().update(data);
        alert('Successfully assigned Technician to ticket!');
        window.location.reload();
    }

    // Retrieve data from both firebase and api database and save into states
    componentDidMount(){
        fetch(URL_API + '/api/tickets') // fetching data from api and receive as json format
            .then((response) => response.json())
            .then((responseJson) => {
                const pendingTickets = [];
                for(const ele in responseJson){
                    firebase.database().ref('ticket/' + responseJson[ele].id).on('value', (snapshot) => {
                        // Compare if the api's ticket is not available in ticket's database reference then push into the array
                       if(snapshot.val() === null){
                           pendingTickets.push(responseJson[ele]);
                       }
                       //force to re-render the view
                        this.forceUpdate();
                    })
                }

                return pendingTickets;
            })
            .then((tickets) => {
                this.setState({
                    tickets: tickets,
                });
            });


        fetch(URL_API + '/api/tickets') // fetching data from api and receive as json format
            .then((response) => response.json())
            .then((responseJson) => {
                const reAssignedTickets = [];
                for(const ele in responseJson){
                    firebase.database().ref('ticket/' + responseJson[ele].id).on('value', (snapshot) => {
                        if (snapshot.val() !== null && snapshot.val().isEscalated === true){
                            // Retrieve and push values that are already in ticket database reference and the isEscalated element is true into an array for reassigned tickets
                            const user_id = snapshot.val().user_id;
                            console.log(user_id);
                            // Getting user from user_id that retrieve before from ticket reference
                                const tech = firebase.database().ref('user/' + user_id);
                                tech.on('value', (data) => {
                                   responseJson[ele].techName = data.val().name;
                                });
                            responseJson[ele].priorityLevel = snapshot.val().priority_level; // adding previous priorityLevel element
                            responseJson[ele].escalationLevel = snapshot.val().escalation_level; // adding previous escalationLevel element
                            reAssignedTickets.push(responseJson[ele]);
                        }
                        //force to re-render the view
                        this.forceUpdate();
                    })
                }
                return reAssignedTickets;
            })
            .then((reAssignedTickets) => {
                this.setState({
                    reAssignedTickets: reAssignedTickets,
                });
            })

    }


    // Retrive data from specific row of table (here is the ticket)
    handleEditClick(cell, row){

        return (
                <Button bsStyle="info" onClick={() => this.ticketDetailsClick(row)}>More Details</Button>
        );
    }

    // Retrive data from specific row of table (here is the ticket)
    handleEditAssignedTicketClick(cell, row){
        return (
            <Button bsStyle="info" onClick={() => this.assignedTicketDetailsClick(row)}>More Details</Button>
        );
    }





    render() {
        return (

            <div>
                <Row>
                    <Col md={(this.state.selectedTicket !== null ? 7 : 12)}>
                        <h1>Pending Tickets</h1>



                            {/*Create a data table with pagination*/}

                        <BootstrapTable
                            data={ this.state.tickets }
                            pagination>
                            <TableHeaderColumn dataField='id' isKey>Ticket ID</TableHeaderColumn>
                            <TableHeaderColumn dataField='user_name'>User Name</TableHeaderColumn>
                            <TableHeaderColumn dataField='issue_title'>Title</TableHeaderColumn>
                            <TableHeaderColumn dataField="edit" dataFormat={this.handleEditClick.bind(this)}>Action</TableHeaderColumn>
                        </BootstrapTable>

                    </Col>

                    {this.state.selectedTicket !== null &&
                        <Col md={5}>
                            <Jumbotron style={{padding: 10}}>
                                <Button block bsStyle="danger"
                                    onClick={this.handleCloseDialog}
                                >Close</Button>
                                <h3 className="text-uppercase" >Ticket Details</h3>
                                <p><b>ID: </b>{this.state.selectedTicket.id}</p>
                                <p><bg>Title: </bg>{this.state.selectedTicket.issue_title}</p>
                                <p><b>Comment: </b>{convertHTMLTag(this.state.selectedTicket.description)}</p>
                                <hr />
                                    <div>
                                        <PriorityLevelDisplay onPriorityLevelChange={this.handlePriorityLevelChange} />
                                        <EscalationLevelDisplay onEscalationLevelChange={this.handleEscalationLevelChange} />
                                        <TechUserDisplay onTechUserInputChange={this.handleTechChange} />
                                        <div className="clearfix text-center"><br/>
                                            <Button className="pull-right" bsStyle="success"
                                                onClick={this.assignTicketToTech}
                                            >Assign</Button>
                                        </div>
                                    </div>
                            </Jumbotron>
                        </Col>
                    }

                </Row>
                <hr />
                <div>
                    <Row>
                        <Col md={(this.state.selectedAssignedTicket !== null ? 7 : 12)}>
                            <h1>Reassigned Tickets</h1>
                            {/*{this.state.tickets.length < 1 && (*/}
                            {/*<p className="alert alert-info" >There are no tickets to display</p>*/}
                            {/*)}*/}

                            <BootstrapTable
                                data={ this.state.reAssignedTickets }
                                pagination>
                                <TableHeaderColumn dataField='id' isKey>Ticket ID</TableHeaderColumn>
                                <TableHeaderColumn dataField='user_name'>User Name</TableHeaderColumn>
                                <TableHeaderColumn dataField='issue_title'>Title</TableHeaderColumn>
                                <TableHeaderColumn dataField="edit" dataFormat={this.handleEditAssignedTicketClick.bind(this)}>Action</TableHeaderColumn>
                            </BootstrapTable>

                        </Col>

                        {this.state.selectedAssignedTicket !== null &&
                        <Col md={5}>
                            <Jumbotron style={{padding: 10}}>
                                <Button block bsStyle="danger"
                                        onClick={this.handleCloseDialog2}
                                >Close</Button>
                                <h3 className="text-uppercase" >Ticket Details</h3>
                                <p><b>ID: </b>{this.state.selectedAssignedTicket.id}</p>
                                <p><bg>Title: </bg>{this.state.selectedAssignedTicket.issue_title}</p>
                                <p><b>Comment: </b>{convertHTMLTag(this.state.selectedAssignedTicket.description)}</p>
                                <p><b>Previous Assigned Tech: </b>{this.state.selectedAssignedTicket.techName}</p>
                                <p><b>Previous Escalation Level: </b>{this.state.selectedAssignedTicket.escalationLevel}</p>
                                <hr />
                                <div>
                                    <PriorityLevelDisplay priorityLevel={this.state.selectedAssignedTicket.priorityLevel} onPriorityLevelChange={this.handlePriorityLevelChange} />
                                    <EscalationLevelDisplay escalationLevel={this.state.selectedAssignedTicket.escalationLevel} onEscalationLevelChange={this.handleEscalationLevelChange} />
                                    <TechUserDisplay onTechUserInputChange={this.handleTechChange} />
                                    <div className="clearfix text-center"><br/>
                                        <Button className="pull-right" bsStyle="success"
                                                onClick={this.reassignTicketToTech}
                                        >Reassign</Button>
                                    </div>
                                </div>
                            </Jumbotron>
                        </Col>
                        }

                    </Row>
                </div>
            </div>
        );
    }
}

// Child of component Helpdesk to declare options of technician
class TechUserDisplay extends Component {

    constructor(props){
        super(props);
        this.state = {
            techUsers: []
        };

        this.techUserInputChange = this.techUserInputChange.bind(this);
    }

    componentDidMount(){

        const users = firebase.database().ref('user/');
        // Read data from user object and push it into an array.
        users.on('value', (data) => {
            const tempTech = [];
            const listOfData = data.val();
            for(const ele in listOfData){
                if(listOfData[ele].type === "tech"){
                    tempTech.push(listOfData[ele]);
                }
            }

            this.setState({
                techUsers: tempTech
            });
        });
    }

    techUserInputChange(e){
        return this.props.onTechUserInputChange(e.target.value);
    }

    render(){
        return(
            <div>
                {this.state.techUsers.length > 0 &&
                    <div>
                        <h3>Assign ticket to technician</h3>
                        <select className="form-control"
                                onChange={this.techUserInputChange}
                                defaultValue="-1"
                        >
                            <option value="-1" defaultValue disabled>Assign to technician</option>
                            {this.state.techUsers.map((value, key) => (
                                <option key={key} value={value.id}>{value.name}</option>
                            ))}
                        </select>
                    </div>
                }
            </div>
        );
    }

}

// Child of component Helpdesk to declare the priority level options
class PriorityLevelDisplay extends Component{

    constructor(props){
        super(props);
        this.priorityLevelChange = this.priorityLevelChange.bind(this);
    }

    priorityLevelChange(e){
        return this.props.onPriorityLevelChange(e.target.value);
    }

    render(){

        // let priorityLevelList = ["LOW", "MODERATE", "HIGH"];

        return(
            <div>
                <h3 className="text-uppercase">Assign priority level</h3>
                <select className="form-control"
                        onChange={this.priorityLevelChange}
                        defaultValue="-1"
                >
                    <option value="-1" defaultValue disabled>Assign priority level</option>
                    {PRIORITY_LEVEL_LIST.map((value, key) => (
                        <option key={key} value={value}>{value}</option>
                    ))}
                </select>
            </div>
        );
    }

}


// Child of component Helpdesk to declare the escalation level options
export class EscalationLevelDisplay extends Component{

    constructor(props){
        super(props);
        this.escalationLevelChange = this.escalationLevelChange.bind(this);
    }

    escalationLevelChange(e){
        return this.props.onEscalationLevelChange(e.target.value);
    }

    render() {

        // let escalationLevelList = [1, 2, 3];

        return (
            <div>
                <h3>Assign escalation level</h3>
                <select className="form-control"
                        onChange={this.escalationLevelChange}
                        defaultValue="-1"
                >
                    <option value="-1" defaultValue disabled>Assign escalation level</option>
                    {ESCALATION_LEVEL_LIST.map((value, key) => (
                        <option key={key} value={value}>{value}</option>
                    ))}
                </select>
            </div>
        );
    }

}



export default Helpdesk;



