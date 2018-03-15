import React from 'react';
import * as helpers from './helpers';

export default class DateInput extends React.Component {
  
  constructor(props){
    super(props)
    this.state = {
      identifier: this.props.identifier,
      label: this.props.label,
      warning: this.props.warning,
      timestamp: this.props.timestamp,
      year: this.props.timestamp.getFullYear(),
      month: this.props.timestamp.getMonth() + 1, // months 0 index
      date: this.props.timestamp.getDate(),
      hours: this.props.timestamp.getHours(),
      minutes: this.props.timestamp.getMinutes(),
      seconds: this.props.timestamp.getSeconds(),
    }
    this.handleChange = this.handleChange.bind(this); // binding necessary so that form recognizes 'this' as the component 'this'
  }

  componentWillMount(){
    this.updateValueLists();
  }

  getNewTimestampProps(){
    this.setState({
      timestamp: this.props.timestamp,
      year: this.props.timestamp.getFullYear(),
      month: this.props.timestamp.getMonth() + 1, // months 0 index
      date: this.props.timestamp.getDate(),
      hours: this.props.timestamp.getHours(),
      minutes: this.props.timestamp.getMinutes(),
      seconds: this.props.timestamp.getSeconds(),
    })
  }

  updateValueLists(key){
    const today = new Date();
    const thisYear = today.getFullYear();
    const yearInQuestion = this.state.timestamp.getFullYear();
    const monthInQuestion = this.state.timestamp.getMonth();
    const maxDays = 
      // MONTHS ARE 0-INDEXED !!!!!!, SO FEB === 1
      ((monthInQuestion === 1) && (yearInQuestion % 4 === 0)) ? 29 :
      monthInQuestion === 1 ? 28 :
      monthInQuestion === ( 0 || 2 || 4 || 6 || 7 || 9 || 11 ) ? 31 :
      30;

    const selectors = {
      year: [],
      month: [],
      date: [],
      hours: [],
      minutes: [],
      seconds: [],
    };
    // hoist date in this script; we might not need to do the whole script
    for (let i = 1; i <= maxDays ; i++) {
      selectors.date.push(    <option key={i} value={i}>{i}</option>)
    } 
    if(key === 'date') {
      const shortSelectors = {...this.state.selectors, date: selectors.date}
      this.setState({selectors: shortSelectors})
      return;
    }
    // end hoisting; continue if key of dates not passed in
    for (let i = thisYear; i <= thisYear+1 ; i++) {
      selectors.year.push(    <option key={i} value={i}>{i}</option>)
    }
    for (let i = 1; i <= 12 ; i++) {
      selectors.month.push(   <option key={i} value={i}>{i}</option>)
    }
    for (let i = 0; i <= 23 ; i++) {
      selectors.hours.push(   <option key={i} value={i}>{i}</option>)
    } 
    for (let i = 0; i <= 59 ; i++) {
      selectors.minutes.push( <option key={i} value={i}>{i}</option>)
    } 
    for (let i = 0; i <= 59 ; i++) {
      selectors.seconds.push( <option key={i} value={i}>{i}</option>)
    } 
    this.setState({selectors})   
  }

  handleChange(event, key) {
    if(this.state.warning > 0 ) return;
    // change via direct typing
    // handled as a promise so that setStatusTest will read the state AFTER updating
    return new Promise((resolve, reject)=>{
      this.setState({ [key]: parseInt(event.target.value,10) }); 
      resolve();
    })
    .then(()=>{
      const timestamp = helpers.convertIntegersToTimeStamp(
        this.state.year,
        this.state.month - 1, // months are 0-indexed
        this.state.date,
        this.state.hours,
        this.state.minutes,
        this.state.seconds,
      );
      this.props.getTimestampFromSelectors(this.props.identifier, timestamp);
      if(key === 'month' || key === 'year'){
        this.updateValueLists('date')
      }
      return;
    })
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

    const timestampLive = helpers.convertIntegersToTimeStamp(
      this.state.year,
      this.state.month - 1, // months are 0-indexed
      this.state.date,
      this.state.hours,
      this.state.minutes,
      this.state.seconds,
    );

    const timestampText = <p className='input-label test-date-edit-input-label'>
      {this.state.label}: {helpers.printDateAsString(timestampLive)}
    </p>

    const selectors = [];
    for (let key in this.state.selectors) {
      selectors.push(
        <select 
          key={key}
          className='test-input-field test-input-select'
          type='text'
          placeholder={key}
          value={this.state[key]}
          id={`${this.state.identifier}${key}`}
          onChange={(e)=>this.handleChange(e, key)} >
            {this.state.selectors[key]}
        </select>
      )
    }

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
        {selectors}
        {setNowButton}
      </div> 
    );
  }

}