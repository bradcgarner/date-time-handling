import React from 'react';

export default function LoadingModal(props) {

  return (
    <div className='modal-container'>
      <div className='modal-background'
        onClick={()=>{}}>
      </div>
      <div className={'modal-loading-spinner'}>
        <i className="fas fa-spinner-third"></i>
      </div>
    </div>
  );
}