import React from 'react'

class TestImage extends React.Component {

    constructor(props) {
        super(props)
        this.sourceUrl = '';
    }

    imageUrlChange = (e) => {
        e.preventDefault();
        this.setState({
            sourceUrl: e.target.value
        })
    }

    render() {
        return (
            <img src={this.state.sourceUrl} alt='' />
        )
    }
}

export default TestImage