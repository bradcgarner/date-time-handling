import React from 'react';

export default class UserLogin extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      pwType: true,
      eyeColor: 'eyeGray'
    }
  }

  login(e){
    e.preventDefault();
    this.props.login(this.inputE.value, this.inputP.value)
  }

  toggleEye() {
    const pwType = !this.state.pwType;
    const eyeColor = pwType ? 'eyeGray' : 'eyeBlue' ;
    this.setState({ pwType, eyeColor })
  }
  
  render() {

    return (
      <form className='login-form' onSubmit={this.login.bind(this)}>
        <input 
          type="text" 
          ref={ el => this.inputE = el }
          placeholder='email'
          required />
        <div className='password'>
          <input 
            type={this.state.pwType ? 'password' : 'text'} 
            ref={ el => this.inputP = el }
            placeholder='password'
            required />
          <button
            className={`eyeButton ${this.state.eyeColor}`}
            type='button'
            onClick={()=>this.toggleEye()} >
            <i className='fas fa-eye'></i>
          </button>
        </div>
        <button className='submitButton' type="submit">Log In</button>
      </form>
    );
  }
}