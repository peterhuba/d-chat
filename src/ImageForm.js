import React from 'react'
import { CustomInput, Button, InputGroup, InputGroupAddon, FormGroup, Form } from 'reactstrap';

class ImageForm extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            image: ''
        }
    }

    handleImageChange = (e) => {
        this.setState({
            image: e.target.files[0]
        });
        this.props.imageUpdate(e.target.files[0]);
    }

    handleImageSubmit = (e) => {
        e.preventDefault()
        if (this.state.image) {
            this.props.send();
        }
        this.setState({
            image: null
        });
        this.props.imageUpdate(null);
    }

    render() {
        return (
            <Form onSubmit={this.handleImageSubmit}>
                <FormGroup>
                    <InputGroup>
                        <CustomInput onChange={this.handleImageChange} type="file" id="fileBrowser" name="imageFileUpload" />
                        <InputGroupAddon addonType="prepend">
                            <Button outline color="danger">Send</Button>
                        </InputGroupAddon>
                    </InputGroup>
                </FormGroup>
            </Form>
        )
    }
}

export default ImageForm;