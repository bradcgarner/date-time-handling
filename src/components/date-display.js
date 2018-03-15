import React from 'react';
import * as helpers from './helpers';

export default function DateDisplay(props) {

  const displayField = 
      
    props.display === 'early' ?
      <p className='test-input-field test-input-display'
        id={props.identifier}>
        too early
      </p> :

    props.display === 'date' ?
      <p className='test-input-field test-input-display'
        id={props.identifier}>
        {helpers.printDateAsString(props.timestamp)}
      </p> : 
    
    // DEFAULT: props.display === 'set' ?
      <p className='test-input-field test-input-display'
        id={props.identifier}
        onClick={(e)=>props.handleTimestampButton(props.identifier)} >
        click to set
      </p> ;

  return (
    displayField
  );
}