import React from 'react';
import * as helpers from './helpers';

export default function TestListItem(props){

  const timestamp = props.test.timestampEnd ? props.test.timestampEnd : 
    props.test.timestampOff ? props.test.timestampOff : 
    props.test.timestampStart ? props.test.timestampStart : 
    props.test.timestampOn ;

  const date = timestamp ? timestamp.slice(0,10) : '' ;
  const status = props.test.statusTest;

  const statusIcon = status === 9 ? <i className="fas fa-thermometer-full"></i> :
                     status === 7 ? <i className="fas fa-thermometer-three-quarters"></i> :
                     status === 5 ? <i className="fas fa-thermometer-half"></i> :
                     status === 3 ? <i className="fas fa-thermometer-quarter"></i> :
                                    <i className="fas fa-thermometer-empty"></i> ;

  const narrative = props.test.narrative.length > 30 ? props.test.narrative.substring(0, 27) + '...' : props.test.narrative ;
  
  return (
    <tr className='test-list-item'
      onClick={e=>props.selectTest(props.test.id, props.index)}>
      <td className='test-list-status'>{statusIcon}</td>
      <td className='test-list-name'>{props.test.testname}</td>
      <td className='test-list-profile'>{props.test.testProfile}</td>
      <td className='test-list-narrative'>{narrative}</td>
      <td className='test-list-storm'>{props.test.storm}</td>
      <td className='test-list-date'>{date}</td>
      <td className='test-list-tester'>{props.test.tester}</td>
    </tr>
  );
}