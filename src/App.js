import React from 'react'

import { Button, Spinner, Container, Row, Col, Jumbotron } from 'reactstrap';
import { NavbarToggler, Collapse, Navbar, NavbarBrand, Nav, NavItem, NavLink } from 'reactstrap';

import toaster from 'toasted-notes';
import 'toasted-notes/src/styles.css';

import MessageList from './MessageList.js'
import Messaging from './Messaging.js';

class App extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            messages: [],
            showNavbar: false,
            appStarted: false,
            workerInitialized: false,
            show: false,
            isNameAvailable: false,
            name: undefined,
            threadName: 'default'
        }

        this.broadcastChannel = new BroadcastChannel('broadcastChannel');
        this.toggleNavbar = this.toggleNavbar.bind(this);
    }

    toggleNavbar(e) {
        this.broadcastChannel.postMessage({ command: 'initialSync' });
        e.preventDefault();
        this.setState({
            showNavbar: !this.state.showNavbar
        });
    }

    componentDidMount() {
        this.broadcastChannel.addEventListener('message', this.receiveMessageFromWorker);
        this.sendInitialSyncMessageToWorker();
    }

    receiveMessageFromWorker = (event) => {
        if (event.data.command === 'workerInitialized') {
            this.setState({ appStarted: true });
            toaster.notify('App started', {
                position: 'bottom-right',
                duration: 3000
            });
            return;
        } else if (event.data.command === 'dbSynced') {
            toaster.notify('Message database synced!', {
                position: 'bottom-right',
                duration: 3000
            });
            return;
        } else if (event.data.command === 'appPinned') {
            toaster.notify('Serving application to peers', {
                position: 'bottom-right',
                duration: 3000
            });
            return;
        } else if (event.data.command === 'saveUsername') {
            this.setState({ isNameAvailable: event.data.success });
            return;
        } else if (event.data.command === 'currentlySetName') {
            const name = event.data.name;
            this.setState({ name: name });
        }

        const receivedMessagesList = event.data.messages;
        this.setState({ messages: receivedMessagesList });
    }

    sendMessageToWorker = (message) => {
        this.broadcastChannel.postMessage(message);
    }

    sendInitialSyncMessageToWorker = () => {
        this.broadcastChannel.postMessage({ command: 'initialSync' });
    }

    saveUsername = (username) => {
        this.broadcastChannel.postMessage({ command: 'saveUsername', value: username });
    }

    setThread = (threadName) => {
        this.broadcastChannel.postMessage({ command: 'setThread', value: threadName });
    }

    addImageWithHashToList = (imageHash) => {
        const { messages } = this.state;

        if (this.isHashNotEmpty(imageHash)) {
            messages.push({ sender: 'test', imageHash: imageHash });
        }

        this.setState({ messages: messages });
    }

    isHashNotEmpty = (imageHash) => {
        return imageHash != null && imageHash !== '';
    }

    renderInitialState = () => {
        return (
            <Jumbotron tag="section" className="jumbotron-header text-center mb-3" style={{ background: "whitesmoke" }}>
                <Container>
                    <p className="lead">
                        <img src="icon-512x512.png" alt="" width="150px" />
                    </p>
                    <h1 className="jumbotron-heading display-4">d-chat</h1>
                    <p className="lead">Decentralized communication platform based on IPFS</p>
                    <div class="d-flex justify-content-center">
                        <Button outline color="danger" disabled >Starting the app...</Button>
                    </div>
                    <br />
                    <br />
                    <Spinner color="danger" />
                </Container>
            </Jumbotron>
        );
    }

    renderLoadedState = () => {
        const { messages } = this.state;
        return (
            <div>
                <Container tag="section" className="text-center mb-4">
                    <img src="icon-512x512.png" alt="" width="80px" />
                </Container>
                <Container>
                    <Row className="justify-content-sm-center">
                        <Col >
                            <main>
                                <MessageList messages={messages} />
                                <br />
                                <Messaging send={this.sendMessageToWorker}
                                    saveUsername={this.saveUsername}
                                    name={this.state.name}
                                    threadName={this.state.threadName}
                                    setThread={this.setThread}
                                    isNameAvailable={this.state.isNameAvailable}
                                    getImageByHash={this.addImageWithHashToList} />
                            </main>
                        </Col>
                    </Row>
                </Container>
            </div>
        );
    }

    render() {
        return (
            <div>
                <img src="ipfs/QmSGfXuqtuGX5FLdBEH5hRQJc6ZrZWV6rqExLXjfpsihV2" style={{ display: "none" }} alt="" />
                <Navbar className="header" color="faded" light expand="md">
                    <Container>
                        <NavbarBrand className="mr-auto" to="/">d-chat v2</NavbarBrand>
                        <NavbarToggler onClick={this.toggleNavbar} />
                        <Collapse navbar isOpen={this.state.showNavbar}>
                            <Nav navbar className="ml-sm-auto">
                                <NavItem>
                                    <NavLink href="https://github.com/orbitdb/orbit-db">OrbitDB</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink href="https://ipfs.io">IPFS</NavLink>
                                </NavItem>
                            </Nav>
                        </Collapse>
                    </Container>
                </Navbar>
                {this.state.appStarted ? this.renderLoadedState() : this.renderInitialState()}
            </div>
        );
    }
}

export default App;
