import React from 'react'
import { Input, InputGroup, InputGroupAddon, Button, FormGroup, Form, Badge, Label } from 'reactstrap';

class NameForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            name: ''
        }
    }

    handleNameChange = (e) => {
        e.preventDefault();
        this.setState({
            name: e.target.value
        });

        this.props.name = e.target.value;
        this.props.nameUpdate(e.target.value);
    }

    handleNameSubmit = (e) => {
        e.preventDefault()
        if (this.state.name) {
            this.props.save();
        }
    }

    getNameAvailabilityMessage = () => {
        if (this.props.isNameAvailable) {
            return (<Badge color="light">name is available and saved</Badge>)
        } else {
            return (<Badge color="warning">name not available</Badge>)
        }
    }

    render() {
        return (
            <div>
                <Label>Currently set name:</Label>
                <br />
                <Badge>{this.props.name}</Badge>
                <br />
                <br />
                <br />
                <Label>Set your display name:</Label>
                <Form
                    onSubmit={this.handleNameSubmit}>
                    <FormGroup>
                        <InputGroup>
                            <Input
                                onChange={this.handleNameChange}
                                value={this.state.name}
                                placeholder="Type your name here"
                                type="text" />
                            <InputGroupAddon addonType="prepend">
                                <Button outline color="danger">Save</Button>
                            </InputGroupAddon>
                        </InputGroup>
                    </FormGroup>
                    {this.getNameAvailabilityMessage()}
                </Form>
                <br />
                <br />
            </div>
        )
    }
}

export default NameForm;