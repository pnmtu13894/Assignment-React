import React, {Component} from 'react';
import {URL_API, convertHTMLTag,} from "../../FileHelpers/helper";
import firebase from 'firebase';
import {Jumbotron, Table, Row, Col, FormGroup, ControlLabel, Button} from 'react-bootstrap';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css';
import TinyMCE from 'react-tinymce';




class CommentDisplay extends Component{

    constructor(props){
        super(props);
        this.state={
            currentComment: ""
        };

        this.handleInputComment = this.handleInputComment.bind(this);
        this.handleSubmitComment = this.handleSubmitComment.bind(this);
    }

    handleInputComment(e){
        // return this.props.onHandleSubmitComment(e.target.value);
        this.setState({
           currentComment: e.target.getContent()
        });
    }

    handleSubmitComment(){
        // alert('Submitted the comment: ' + this.state.submitComment);
        var ticket_id = this.props.ticket_id;
        var content = this.state.currentComment;

        console.log(this.state.currentComment);


        fetch(URL_API + "/api/comments", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                ticket_id: ticket_id,
                ticket_comment: content
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status === "SUCCESS") {
                    alert("Successfully created product!");
                } else {
                    alert("Could not create product.");
                }
            });
    }

    render(){
        return (

            <Col md={12}>
                <Jumbotron style={{padding: 10}}>

                    <h2>Add comments to ticket #{this.props.ticket_id}</h2>
                    <hr />
                    <FormGroup controlId="formControlsTextarea">
                        <ControlLabel className="text-left">Add Comment</ControlLabel>
                        <TinyMCE
                            config={{
                                plugins: 'link image code',
                                toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
                            }}
                            value={this.state.currentComment}
                            onChange={this.handleInputComment}
                        />
                        </FormGroup>
                    <div className="clearfix text-center"><br/>
                        <Button className="pull-right" bsStyle="success"
                                onClick={this.handleSubmitComment}
                        >Assign</Button>
                    </div>
                </Jumbotron>
            </Col>

        );
    }

}

class TicketDetailsDisplay extends Component {

    constructor(props){
        super(props);
        this.state = {
            submitStatus: null,
            isEscalated: false
        };

        this.statusChange = this.statusChange.bind(this);
        this.updateSelectedTicket = this.updateSelectedTicket.bind(this);
        this.deleteSelectedTicket = this.deleteSelectedTicket.bind(this);
        this.toggleChange = this.toggleChange.bind(this);
    }

    toggleChange(){

        var title = "";
        if(this.state.isEscalated === false){
            title = "Are you sure to escalate to higher levels?";
        } else {
            title = "Are you sure to cancel escalating?"
        }

        confirmAlert({
            message: title,               // Message dialog
            confirmLabel: 'Yes',                           // Text button confirm
            cancelLabel: 'Cancel',                             // Text button cancel
            onConfirm: () => {
                this.setState({
                    isEscalated: !this.state.isEscalated
                });
            },
        })


    }

    deleteSelectedTicket(){

        confirmAlert({
            title: 'Confirm to delete',                        // Title dialog
            message: 'Are you sure to delete this ticket?',               // Message dialog
            confirmLabel: 'Yes',                           // Text button confirm
            cancelLabel: 'Cancel',                             // Text button cancel
            onConfirm: () => {
                const id = this.props.selectedTicket.id;

                firebase.database().ref().remove('ticket/' + id);

                fetch(URL_API + "/api/tickets/" + id + "/delete", {
                    method: 'GET'
                })
                    .then((response) => response.json())
                    .then((responseJson) => {
                        if(responseJson.status === "SUCCESS"){
                            alert("Successfully deleted ticket!");
                            window.location.reload();
                        } else {
                            alert("Could not delete ticket.");
                        }
                    })
            },
        })


    }

    updateSelectedTicket(){

        const id = this.props.selectedTicket.id;
        var status_id = 1;
        if(this.state.submitStatus === "IN PROGRESS"){
            status_id = 2;
        } else if(this.state.submitStatus === "UNRESOLVED"){
            status_id = 3;
        } else if(this.state.submitStatus === "RESOLVED"){
            status_id = 4;
        }

        const data = {};
        data['ticket/' + id + "/isEscalated"] = this.state.isEscalated;
        firebase.database().ref().update(data);

        fetch(URL_API + "/api/ticket/"+ id + "/updateStatus", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status_id: status_id
            })
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.status === "SUCCESS") {
                    alert("Successfully Update Ticket!");
                    window.location.reload();
                } else {
                    alert("Could not update ticket.");
                }
            });



    }

    statusChange(e){
        this.setState({
            submitStatus: e.target.value
        });
    }

    componentDidMount(){
        this.props.statuses.map((status) => {
           if(this.props.selectedTicket.status_id === status.id && status.id !== null){
               this.setState({submitStatus: status.name});
           }
        });
    }


    render(){

        const ticket= this.props.selectedTicket;

        return (

                <Col md={5}>
                    <Jumbotron style={{padding: 10}}>
                        <Button block bsStyle="danger"
                                onClick={this.props.handleCloseDialog}
                        >Close</Button>
                        <h3 className="text-uppercase" >Ticket Details</h3>
                        <p><b>ID: </b>{ticket.id}</p>
                        <p><bg>Title: </bg>{ticket.issue_title}</p>
                        <p><b>Comment: </b>{convertHTMLTag(ticket.description)}</p>
                        <hr />
                        <div>
                            <div>
                                <h3>Change Ticket Status</h3>
                                <select className="form-control"
                                        onChange={this.statusChange}
                                        value={this.state.submitStatus}
                                >
                                    {this.props.statuses.map((status, key) => (
                                        <option key={key} value={status.name}>{status.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{margin: 10, padding: 10}}>
                                <label className="pull-left">
                                    <input type="checkbox"
                                           checked={this.state.isEscalated}
                                           onChange={this.toggleChange}
                                    />
                                    &nbsp; Escalate to higher levels
                                </label>
                            </div>
                            <hr />
                            <div>
                                <div className="clearfix text-center"><br/>
                                    <Button className="pull-left" bsStyle="success"
                                            onClick={this.updateSelectedTicket}
                                    >Update Ticket</Button>

                                    <Button className="pull-right" bsStyle="danger"
                                            onClick={this.deleteSelectedTicket}
                                            disabled={(ticket.status_id === 3 || ticket.status_id === 4) ? false : true}
                                    >Delete Ticket</Button>
                                </div>
                            </div>

                        </div>

                    </Jumbotron>
                </Col>


        );
    }

}

class Technician extends Component {

    constructor(props){
        super(props);
        this.state = {
        tickets: [],
        statuses: [],
        selectedTicket: null,
        selectedStatus: null,
            selectedTicketComment: null,
            submitComment: "",
        selectedEscalationLevel: null
    };

    this.ticketDetailsClick = this.ticketDetailsClick.bind(this);
    this.handleCloseDialog = this.handleCloseDialog.bind(this);
    this.ticketCommentClick = this.ticketCommentClick.bind(this);
    this.handleCloseCommentDialog = this.ticketCommentClick.bind(this);
    this.handleStatusChange = this.handleStatusChange(this);
}


    handleStatusChange(status){
        this.setState({submitComment: status});
    }


    ticketDetailsClick(ticket){
        this.setState({
            selectedTicket: (this.state.selectedTicket !== null && this.state.selectedTicket.id === ticket.id ? null : ticket)
        });
    }

    ticketCommentClick(ticket){
        this.setState({
            selectedTicketComment: (this.state.selectedTicketComment !== null && this.state.selectedTicketComment.id === ticket.id ? null : ticket)
        });
    }

    handleCloseDialog(){
        this.setState({
            selectedTicket: null
        });
    }

    handleCloseCommentDialog(){
        this.setState({
           selectedTicketComment: null
        });
    }


    componentDidMount(){

        fetch(URL_API + '/api/tickets')
            .then((response) => response.json())
            .then((responseJson) => {
            const myTickets = [];
            for(const ele in responseJson) {
                firebase.database().ref('ticket/'+responseJson[ele].id).on('value', (snapshot) => {
                    if(snapshot.val() !== null && snapshot.val().user_id === this.props.user.uid && snapshot.val().isEscalated === false) {
                        myTickets.push(responseJson[ele]);

                        /* Force the view to re-render (async problem) */
                    this.forceUpdate();
                }
            })
        }
        return myTickets;
        })
            .then((tickets) => {
                this.setState({
                tickets: tickets
                });
        });

    fetch(URL_API + "/api/fetch/statuses")
        .then((response) => response.json())
        .then((results) => {
            const status_list = [];
            for(const ele in results){
                // if(results.length > 0 && results[ele].name !== null){
                    status_list.push(results[ele]);
                // }
            }
            return status_list;
        })
        .then((statuses) => {
            this.setState({
                statuses: statuses
            });
        });


    }

    render() {


        return (
            <div>
                <h1>My Tickets</h1>
                <Row>
                    <Col md={(this.state.selectedTicket !== null ? 7 : 12)}>
                        {this.state.tickets.length < 1 && (
                            <div className="alert alert-info">You have not been assigned any tickets.</div>
                        )}
                            <Table>
                                <thead>
                                <tr>
                                    <td>Title</td>
                                    <td>Description</td>
                                    <td>Current Status</td>
                                    <td>Actions</td>
                                </tr>
                                </thead>
                                <tbody>
                                    {this.state.tickets.map((ticket, key) => (
                                        <tr key={key}>
                                            <td>{ticket.issue_title}</td>
                                            <td>{convertHTMLTag(ticket.description)}</td>
                                            <td><span className={ticket.status_id === 1 ?
                                                    'label label-primary' : ticket.status_id === 2 ?
                                                    'label label-success' : ticket.status_id === 3 ?
                                                    'label label-warning' : ticket.status_id === 4 ?
                                                    'label label-danger' : null
                                            }>{this.state.statuses.map((status) => {
                                                if(status.id === ticket.status_id)  {
                                                return status.name;
                                                }
                                            })}
                                            </span></td>
                                            <td>
                                                <Button
                                                    bsStyle={this.state.selectedTicket !== null &&
                                                    this.state.selectedTicket.id === ticket.id ? 'success' : 'info'}
                                                    onClick = {() => this.ticketDetailsClick(ticket)} style={{margin: 10}}
                                                    >Edit Ticket</Button>

                                                <Button
                                                    bsStyle={this.state.selectedTicketComment !== null &&
                                                    this.state.selectedTicketComment.id === ticket.id ? 'success' : 'info'}
                                                    onClick={() => this.ticketCommentClick(ticket)}
                                                >Add Comment</Button>
                                                </td>

                                            </tr>
                                        ))}
                                        </tbody>
                                    </Table>
                                    <hr />
                </Col>
                {this.state.selectedTicket !== null &&
                    <TicketDetailsDisplay
                        onStatusChange={this.handleStatusChange}
                        handleCloseDialog={this.handleCloseDialog}
                        selectedTicket={this.state.selectedTicket}
                        statuses={this.state.statuses} />
                }
                    {this.state.selectedTicketComment !== null &&
                        <CommentDisplay ticket_id={this.state.selectedTicketComment.id}  />
                    }
            </Row>

        </div>
    );
}
}





export default Technician;