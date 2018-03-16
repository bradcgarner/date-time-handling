import React from 'react';
import * as dateTime from './date-time-pure-functions';
import TimePicker from 'rc-time-picker';
import DatePicker from 'react-datepicker';
import moment from 'moment';

export default class DatePickInput extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
      identifier: this.props.identifier,
      label: this.props.label,
      warning: this.props.warning,
      timestamp: this.props.timestamp,
      date: new Date(
        this.props.timestamp.getFullYear(),
        this.props.timestamp.getMonth() + 1,
        this.props.timestamp.getDate(),
      ),
      time: new Date(
        1,1,1,
        this.props.timestamp.getHours(),
        this.props.timestamp.getMinutes(),
        this.props.timestamp.getSeconds(),
      ),
      // year: this.props.timestamp.getFullYear(),
      // month: this.props.timestamp.getMonth() + 1, // months 0 index
      // day: this.props.timestamp.getDate(),
      // hours: this.props.timestamp.getHours(),
      // minutes: this.props.timestamp.getMinutes(),
      // seconds: this.props.timestamp.getSeconds(),
      pickers: ['date', 'time'],
    }
    this.handleChange = this.handleChange.bind(this); // binding necessary so that form recognizes 'this' as the component 'this'
  }

  getNewTimestampProps(){
    this.setState({
      timestamp: this.props.timestamp,
      date: new Date(
        this.props.timestamp.getFullYear(),
        this.props.timestamp.getMonth() + 1,
        this.props.timestamp.getDate(),
      ),
      time: new Date(
        1,1,1,
        this.props.timestamp.getHours(),
        this.props.timestamp.getMinutes(),
        this.props.timestamp.getSeconds(),
      ),
    });
  }

  handleChange(event, key) {
    console.log('target', key, event.target.value);
    if(this.state.warning > 0 ) return;
    return;
    if(key === 'date'){
      this.setState({ date: new Date(
        this.props.timestamp.getFullYear(),
        this.props.timestamp.getMonth() + 1,
        this.props.timestamp.getDate(),
      )}); 
    } else {
      const time = dateTime.convertTimeStampToIntegers(event.target.value)
      console.log('time only', time);
      this.setState({ time: new Date(
        1,1,1,
        this.props.timestamp.getHours(),
        this.props.timestamp.getMinutes(),
        this.props.timestamp.getSeconds(),
      )});
    }
  }

  handleTimestampButton(){
    if(this.state.warning > 0 ) return;
    return new Promise((resolve, reject)=>{
      this.props.handleTimestampButton(this.state.identifier, true)
      resolve();
    })
    .then(()=>{
      this.getNewTimestampProps();
    })
  }

  clearWarning(){
    this.setState({warning: 0})
  }

  render() {

    const warningClass = this.state.warning > 1 ? 
      'warning warning-big' : 
      'warning' ;
    const warningText = this.state.warning > 1 ? 
      `WHOA!!! We have moved past ${this.state.label}! Are you SURE you want to change ${this.state.label} time?` :
      `WARNING! A time is already set for ${this.state.label}. Are you SURE you want to change ${this.state.label} time?` ;

    const warning = this.state.warning > 0 ? 
      <div className='warning-container'>
        <p className={warningClass}>
          {warningText}
        </p>
        <button
          type='button'
          className='warning-button'
          onClick={()=>this.clearWarning()}>
          Yeah, prior time was a mistake
        </button>
      </div> : null ;

    const timestampLive = dateTime.convertIntegersToTimeStamp(
      this.state.year,
      this.state.month - 1, // months are 0-indexed
      this.state.date,
      this.state.hours,
      this.state.minutes,
      this.state.seconds,
    );

    const timestampText = <p className='input-label test-date-edit-input-label'>
      {this.state.label}: {dateTime.printDate(timestampLive)}
    </p>

    const selectors = this.state.pickers.map((item, index)=>{
      const key = this.state.pickers[index];
        return <input 
          key={key}
          className='test-input-field test-input-select'
          type={key}
          value={this.state[key]}
          id={`${this.state.identifier}${key}`}
          onChange={(e)=>this.handleChange(e, key)} />
    });

    const setNowButton = <button 
      type='button'  
      className='input-set-now-button'
      onClick={(e)=>this.handleTimestampButton()}>
      set {this.state.label} to now
    </button> ;

    return (
      <div className='test-date-edit-container'>
        {warning}
        {timestampText}
        <DatePicker/>
        <TimePicker/>
        {setNowButton}
      </div> 
    );
  }

}