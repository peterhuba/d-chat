import React from 'react'
import { Button, InputGroup, InputGroupAddon, FormGroup, Form } from 'reactstrap';
import Input from 'reactstrap/lib/Input';

class TestArea extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            testImageHash: ''
        }
    }

    handleTestImageHashChange = (e) => {
        this.setState({
            testImageHash: e.target.value
        })
    }

    handleTestImageHashSubmit = (e) => {
        e.preventDefault()
        if (this.state.testImageHash) {
            this.props.send(this.state.testImageHash)
        }
    }

    render() {
        return (
            <Form
                onSubmit={this.handleTestImageHashSubmit}
                className="send-message-form">
                <FormGroup>
                    <InputGroup>
                        <Input
                            onChange={this.handleTestImageHashChange}
                            value={this.state.testImageHash}
                            placeholder="Type image hash"
                            type="text" />
                        <InputGroupAddon addonType="prepend">
                            <Button color="danger">Get</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </FormGroup>
            </Form>
        )
    }
}

export default TestArea