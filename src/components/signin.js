import React, { Component } from 'react';
import { connect } from 'react-redux';
import { signinAction, errorMessage } from '../store/actions/action';
import { Col, ProgressBar, Row, Input, Button ,Modal,modal} from 'react-materialize';
import {
    Link
} from 'react-router-dom';
import $ from "jquery";

const divStyle = {
    marginLeft: '700px',
    marginTop:"250px"
  };
class Signin extends Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        }
        this.signin = this.signin.bind(this);
        this._onChangeEmail = this._onChangeEmail.bind(this);
        this._onChangePassword = this._onChangePassword.bind(this);
        // this._onChangeType=this._onChangeType.bind(this);
    }

    signin(event) {//Method that dispatch an action
        event.preventDefault();
        if((this.state.email === '' || this.state.password === ''))
        {
            this.props.errorMessage('Both the fields are required!');
        }
        else{
            let user = {
                email: this.state.email,
                password: this.state.password
            }
            this.props.signinWithEmailPassword(user);
        }
    }
    // _onChangeType(ev){
    //     console.log(ev.target.value);
    //     this.setState({
    //         type:ev.target.value
    //     })
    // }
    _onChangeEmail(event) {// Onchange Event Handlers
        this.setState({
            email: event.target.value
        })
    }
    _onChangePassword(event) {
        this.setState({
            password: event.target.value
        })
    }
    componentWillMount(){
        this.props.errorMessage('');
    }
    render() {
        return (
            <div>
	<Modal
    header="Sign In"
    style={{height:"50%",overflow:"hidden"}}
	trigger={<Button style={divStyle}>SignIn</Button>}>
    <Row >
                <Col s={3}></Col>
                <Col s={6} style = {{height : '400px',  borderTop : 'none'}}>
                    
                    <form onSubmit={this.signin.bind(this)}>
                        <Input s= {12} type="email" name='email' value={this.state.email} title = 'type password here' onChange={this._onChangeEmail} label="Type Email Here" validate></Input>
                        <br />
                        <Input s= {12} type='password' name='password' value={this.state.password} title = 'type email here' onChange={this._onChangePassword} label='Type Password Here' validate/>
                        <br />
                        {/* <Row >
                            <Input s={6} type='select' label="Login As" defaultValue='Student' onChange={this._onChangeType}>
                                <option value='Student'>Student</option>
                                <option value='Company'>Company</option>
                                
                            </Input>
                        </Row> */}
                        <Button className="btn waves-effect waves-light" type="submit" name="action" title = 'signin' style = {{display : 'block'}}>Signin</Button>
                        <Link to='/'>Create Account</Link>
                    <div><p style = {{color : "red"}}>{this.props.errorMsg}</p></div>
                    </form>
                    {
                        (this.props.progressBarDisplay) ? (
                            <Col s={12}>
                                <ProgressBar />
                            </Col>
                        ) :
                            null
                    }
                </Col>
                <Col s={3}></Col>
            </Row>
</Modal>
</div>
            // <Row >
            //     <Col s={3}></Col>
            //     <Col s={6} style = {{height : '400px', border: '1px solid gray', borderTop : 'none'}}>
            //         <h1>Signin</h1>
            //         <form onSubmit={this.signin.bind(this)}>
            //             <Input s= {12} type="email" name='email' value={this.state.email} title = 'type password here' onChange={this._onChangeEmail} label="Type Email Here" validate></Input>
            //             <br />
            //             <Input s= {12} type='password' name='password' value={this.state.password} title = 'type email here' onChange={this._onChangePassword} label='Type Password Here' validate/>
            //             <br />
            //             {/* <Row >
            //                 <Input s={6} type='select' label="Login As" defaultValue='Student' onChange={this._onChangeType}>
            //                     <option value='Student'>Student</option>
            //                     <option value='Company'>Company</option>
                                
            //                 </Input>
            //             </Row> */}
            //             <Button className="btn waves-effect waves-light" type="submit" name="action" title = 'signin' style = {{display : 'block'}}>Signin</Button>
            //             <Link to='/'>Create Account</Link>
            //         <div><p style = {{color : "red"}}>{this.props.errorMsg}</p></div>
            //         </form>
            //         {
            //             (this.props.progressBarDisplay) ? (
            //                 <Col s={12}>
            //                     <ProgressBar />
            //                 </Col>
            //             ) :
            //                 null
            //         }
            //     </Col>
            //     <Col s={3}></Col>
            // </Row>
        )
    }
}

function mapStateToProp(state) {
    return ({
        progressBarDisplay: state.root.progressBarDisplay,
        errorMsg : state.root.errorMessage
    })
}
function mapDispatchToProp(dispatch) {
    return ({
        signinWithEmailPassword: (user) => {
            dispatch(signinAction(user))
        },
        errorMessage: (message)=>{
            dispatch(errorMessage(message));
        }
    })
}

export default connect(mapStateToProp, mapDispatchToProp)(Signin);