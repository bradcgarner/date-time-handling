import React from 'react';

export default class UserPwReset extends React.Component {

  reset(e){
    e.preventDefault();
    console.log('reset password for', this.inputE.value)
    // .then(()=>{
    //   console.log('check your email');
    // })
    // .catch(error=>{
    //   console.log(error.code, error.message, error);
    // })
  }

  render() {
    return (
      <form className='pw-reset' onSubmit={this.reset.bind(this)}>
        <input
          type="text" 
          ref={ el => this.inputE = el }
          placeholder='email'
          required />
        <button className='submitButton' type="submit">Password Reset Email</button>
      </form>
    );
  }
}