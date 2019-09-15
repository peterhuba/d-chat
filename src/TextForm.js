import React from 'react'
import { Button, Input, InputGroup, InputGroupAddon, FormGroup, Form } from 'reactstrap';

class TextForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            message: ''
        }
    }

    handleTextChange = (e) => {
        this.setState({
            message: e.target.value
        })
        this.props.messageUpdate(e.target.value);
    }

    handleTextSubmit = (e) => {
        e.preventDefault()
        if (this.state.message) {
            this.props.send();
        }
        this.setState({
            message: ''
        });
        this.props.messageUpdate('');
    }


    render() {
        return (
            <Form
                onSubmit={this.handleTextSubmit}
                className="send-message-form">
                <FormGroup>
                    <InputGroup>
                        <Input
                            onChange={this.handleTextChange}
                            value={this.state.message}
                            placeholder="Type your message"
                            autoFocus
                            type="text" />
                        <InputGroupAddon addonType="prepend">
                            <Button outline color="danger">Send</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </FormGroup>
            </Form>
        )
    }
}


export default TextForm;