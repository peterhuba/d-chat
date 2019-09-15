import React from 'react'
import { ListGroup, ListGroupItem, Container, Card, CardImg, CardBody, CardSubtitle } from 'reactstrap';
import Badge from 'reactstrap/lib/Badge';

class MessageList extends React.Component {

    constructor(props) {
        super(props)
        this.uniqueMessageId = 0;
    }

    getUniqueMessageId = () => this.uniqueMessageId++

    getDisplayName = (message) => {
        if (message.sender != null && message.sender !== '') {
            return message.sender
        } else {
            return message.senderId
        }
    }

    getBadge = (message) => {
        if (message.isOwn) {
            return (<Badge color="danger">{this.getDisplayName(message)}</Badge>);
        } else {
            return (<Badge>{this.getDisplayName(message)}</Badge>);
        }
    }

    messageRow = (message) => (
        <ListGroupItem key={this.getUniqueMessageId()}>
            {this.getBadge(message)}: {message.text}
        </ListGroupItem>
    )

    imageRow = (message) => (
        <Card key={this.getUniqueMessageId()}>
            <CardImg top width="100%" src={`ipfs/${message.imageHash}`} alt="Image received in chat" />
            <CardBody>
                <CardSubtitle>
                    {this.getBadge(message)}
                </CardSubtitle>
            </CardBody>
        </Card>
    )

    placeholder = () => (
        <Container>
            <Card key='0'>
                <CardBody>
                    <p className="lead,align-middle"><i>Your messages will appear here</i></p>
                </CardBody>
            </Card>
        </Container>
    )

    render() {
        const { messages } = this.props;
        if (messages === undefined || messages.length === 0) {
            return this.placeholder();
        } else {
            return (
                <Container>
                    <ListGroup>
                        {messages.map(message => {
                            if (message.imageHash != null) {
                                return this.imageRow(message)
                            } else {
                                return this.messageRow(message)
                            }
                        })}
                    </ListGroup>
                </Container>
            )
        }
    }
}

export default MessageList