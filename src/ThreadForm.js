import React from 'react'
import { Button, Input, InputGroup, InputGroupAddon, FormGroup, Form, Label, Badge } from 'reactstrap';

class ThreadForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            threadName: 'default',
            savedThreadName: 'default'
        }
    }

    handleThreadNameChange = (e) => {
        e.preventDefault();
        this.setState({
            threadName: e.target.value
        });

        this.props.threadName = e.target.value;
        this.props.threadNameUpdate(e.target.value);
    }

    handleThreadNameSubmit = (e) => {
        console.log('thread form submit')
        e.preventDefault()
        if (this.state.threadName) {
            this.setState({
                savedThreadName: this.state.threadName
            });
            this.props.setThread();
        }
    }


    render() {
        return (
            <div>
                <Label>Currently set thread:</Label>
                <br />
                <Badge>{this.state.savedThreadName}</Badge>
                <br />
                <br />
                <br />
                <Label>Set thread:</Label>
                <Form
                    onSubmit={this.handleThreadNameSubmit}
                    className="send-message-form">
                    <FormGroup>
                        <InputGroup>
                            <Input
                                onChange={this.handleThreadNameChange}
                                value={this.state.threadName}
                                placeholder="Type your thread name"
                                autoFocus
                                type="text" />
                            <InputGroupAddon addonType="prepend">
                                <Button outline color="danger">Set</Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                </Form>
            </div>
        )
    }
}


export default ThreadForm;