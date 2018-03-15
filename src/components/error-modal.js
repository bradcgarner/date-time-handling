import React from 'react';

export default function ErrorModal(props) {

  return (
    <div className='modal-container'>
      <div className='modal-background'
        onClick={()=>{}}>
      </div>
      <div className='modal-message'>
        <p>{props.message}</p>
        <div className={'modal-close'} 
          onClick={()=>props.toggleErrorModal(false)}>
          <i className='fas fa-times'></i>
        </div>
      </div>

    </div>
  );
}