import React from 'react';
import * as helpers from './helpers';
import DateDisplay from './date-display';
import DateInput from './date-input';
export default class TestModal extends React.Component {
  
  // App.js fetches all tests from server with timestamps as strings
  // Timestamps are ALWAYS strings in Zulu time outside this component
  // On-demand (when modal opens), convert all timestamps to objects (with embedded timezones)
  // Store ONLY as objects in the modal;  Use helper functions to display as strings
  // Convert back to strings on submission (save)
  // TIME ZONES
  // timestamps created as UTC-4:00 (EDT) or UTC-5:00 (EST)
  // convert to string in zulu time by reading the time literal (zone), and applying the offset
  // save in state, handle in server, save in DB all as zulu

  constructor(props){
    super(props)
    this.state = {
      id: this.props.test.id,
      testname: this.props.test.testname || '',
      testProfile: this.props.test.testProfile || '',
      narrative: this.props.test.narrative || '',
      storm: this.props.test.storm || '',
      timestampCreated: this.props.test.timestampCreated ?
        helpers.convertStringToTimeStamp(this.props.test.timestampCreated) : 
        new Date(),
      timestampOn: helpers.convertStringToTimeStamp(this.props.test.timestampOn),
      timestampStart: helpers.convertStringToTimeStamp(this.props.test.timestampStart),
      timestampOff: helpers.convertStringToTimeStamp(this.props.test.timestampOff),
      timestampEnd: helpers.convertStringToTimeStamp(this.props.test.timestampEnd),
      statusEdit: 'none',
      tester: this.props.user.id,
      editing: false,
      statusTest: this.props.test.statusTest,
      statusKeys: helpers.createStatusKeys(),
      index: this.props.index,
    }
    this.handleChange = this.handleChange.bind(this); // binding necessary so that form recognizes 'this' as the component 'this'
  }

  componentWillMount(){
    const statusTest = helpers.calcStatusInt(this.state, this.state.statusKeys);
    this.setState({statusTest})
  }

  handleChange(event, key) {
    // change via direct typing
    // handled as a promise so that calcStatusInt will read the state AFTER updating
    return new Promise((resolve, reject)=>{
      this.setState({ 
        [key]: event.target.value,
        editing: true,
      }); 
      resolve();
    })
    .then(()=>{
      const statusTest = helpers.calcStatusInt(this.state, this.state.statusKeys);
      this.setState({statusTest})
    })
  }

  handleTimestampButton(key, override){
    // if timestamp is NOT already populated, drop in the time
    if(this.state.statusEdit === key && !override){
      this.setState({statusEdit: 'none'})
      return;
    } else if (this.state.statusKeys[key] > this.state.statusTest) {      
      return;
    } else if(!(this.state[key] instanceof Date) || override) {
      // change via button
      // handled as a promise so that calcStatusInt will read the state AFTER updating
      return new Promise((resolve, reject)=>{
        this.setState({[key]: new Date()})
        resolve();
      })
      .then(()=>{
        const statusTest = helpers.calcStatusInt(this.state, this.state.statusKeys);
        this.setState({statusTest})
      })
    } else if( this.state.statusKeys[key] < this.state.statusTest ) { // open the editor, if status (readiness) permits
      const statusTest = helpers.calcStatusInt(this.state, this.state.statusKeys);
      this.setState({
        statusTest,
        statusEdit: key
      });
    }
  }

  getTimestampFromSelectors(key, timestamp){
    this.setState({[key]: timestamp});
  }

  handleSubmit(e){
    e.preventDefault();
    const test = {
      id: this.state.id,
      testname: this.state.testname,
      testProfile: this.state.testProfile,
      narrative: this.state.narrative,
      storm: this.state.storm,
      timestampCreated: helpers.convertTimeStampToString(this.state.timestampCreated),
      timestampOn: helpers.convertTimeStampToString(this.state.timestampOn),
      timestampOff: helpers.convertTimeStampToString(this.state.timestampOff),
      timestampStart: helpers.convertTimeStampToString(this.state.timestampStart),
      timestampEnd: helpers.convertTimeStampToString(this.state.timestampEnd),
      tester: this.state.tester,
      statusTest: this.state.statusTest,
    }
    this.props.saveTestForm(test, this.state.index)
  }

  render() {

    // @@@@@@@@@@@@@@@ GENERAL EDITING FIELDS @@@@@@@@@@@@@@@@@@@

    const fieldKeyArray =         ['testname',      'testProfile', 'narrative',          'storm'];
    const fieldIconArray =        ['fas fa-tags',   'fas fa-bars', 'fas fa-comment-alt', 'fas fa-cloud-download-alt'];
    const fieldLabelArray =       ['test name',     'profile',     'description',        'storm event'];

    const fieldsDivs = fieldKeyArray.map((key, index)=>{

      const iconContainerClass = 
      this.state.statusTest <= this.state.statusKeys.setup ?
        'icon-active' :
        'icon-past' ;

      const fieldClass = 
        this.state.statusTest <= this.state.statusKeys.setup ?
          'field-active' :
          'field-past' ;

      return <div key={`${key}${index}`} className='field-and-icon'>
        <div className={`icon-container ${iconContainerClass}`}>
          <i className={fieldIconArray[index]}></i>
        </div>
        <div className={`field-and-label ${fieldClass}`}>
          <textarea 
            className='test-input-field'
            placeholder={fieldLabelArray[index]}
            onChange={(e)=>this.handleChange(e, key)}
            value={this.state[key]}
            id={key} 
            required />
          <label className='input-label' htmlFor={key}>{fieldLabelArray[index]}</label>
        </div>
      </div>
    });

    // @@@@@@@@@@@@@@@ TIMESTAMP EDITING FIELDS @@@@@@@@@@@@@@@@@@@

    const timestampEditKeyArray =   ['timestampOn',        'timestampOff',        'timestampEnd'];
    const timestampEditIconArray =  ['fas fa-arrow-right', 'fas fa-times-circle', 'fas fa-arrow-left' ];
    const timestampEditLabelArray = ['irrigation on',      'irrigation off',      'test end'];
    
    const timestampEditFields = timestampEditKeyArray.map((key, index)=>{
      
      if (this.state.statusEdit === key) {
        const warning = 
          this.state.statusTest > this.state.statusKeys[key] + 2 ? 2 :
          this.state.statusTest > this.state.statusKeys[key]     ? 1 :
          0 ;
        return <DateInput
          identifier={key}
          label={timestampEditLabelArray[index]}
          timestamp={this.state[key]}
          warning={warning}
          getTimestampFromSelectors={this.getTimestampFromSelectors.bind(this)}
          handleTimestampButton={this.handleTimestampButton.bind(this)}
        />

      } else if(this.state.statusTest < this.state.statusKeys[key]) {
        return <DateDisplay
          display={'early'}
          identifier={key}
          timestamp={this.state[key]}
          handleTimestampButton={this.handleTimestampButton.bind(this)}
        />

      } else if(this.state[key] instanceof Date) {
        return <DateDisplay
        display={'date'}
        identifier={key}
        timestamp={this.state[key]}
        handleTimestampButton={this.handleTimestampButton.bind(this)}
      /> 

      } else {
        return <DateDisplay
          display={'set'}
          identifier={key}
          timestamp={this.state[key]}
          handleTimestampButton={this.handleTimestampButton.bind(this)}
        />
      }
    });

    const timestampEditFieldsDivs = timestampEditKeyArray.map((key, index)=>{
      const labelClass = this.state.statusEdit === key ?
        'input-label test-date-edit-input-label' :
        'input-label' ;
      const iconContainerClass = 
        this.state.statusTest === this.state.statusKeys[key] ?
          'icon-active' :
        this.state.statusTest < this.state.statusKeys[key] + 2 ?
          'icon-future' :
          'icon-past' ;

      const fieldClass = 
        this.state.statusTest === this.state.statusKeys[key] ?
          'field-active' :
        this.state.statusTest < this.state.statusKeys[key] + 2 ?
          'field-future' :
          'field-past' ;

      return <div key={`${key}${index}`} className='field-and-icon'>
        <div className={`icon-container ${iconContainerClass}`}
          onClick={(e)=>this.handleTimestampButton(key)}>
          <i className={timestampEditIconArray[index]}></i>
        </div>
        <div className={`field-and-label ${fieldClass}`}>
          {timestampEditFields[index]}
          <label className={labelClass} htmlFor={key}>{timestampEditLabelArray[index]}</label>
        </div>
        
      </div>
    });

    // @@@@@@@@@@@@@@@ DISPLAY-ONLY FIELDS @@@@@@@@@@@@@@@@@@@

    const timestampStartText = this.state.timestampStart instanceof Date ? helpers.printDateAsString(this.state.timestampStart) : 'calculated by first weight increase' ;

    const displayKeyArray =   ['timestampCreated',    'timestampStart'];
    const displayIconArray =  ['far fa-check-circle', 'fas fa-tint'];
    const displayLabelArray = ['test created',        'test start'];
    const displayTextArray =  [helpers.printDateAsString(this.state.timestampCreated), timestampStartText]

    const displayDivs = displayKeyArray.map((key, index)=>{
    
      const iconContainerClass = 
        this.state.statusTest === this.state.statusKeys[key] + 2 ?
          'icon-active' :
        this.state.statusTest < this.state.statusKeys[key] + 2 ?
          'icon-future' :
          'icon-past' ;

      const fieldClass = 
          this.state.statusTest === this.state.statusKeys[key] + 2 ?
            'field-active' :
          this.state.statusTest < this.state.statusKeys[key] + 2 ?
            'field-future' :
            'field-past' ;

      return <div key={`${key}${index}`} className='field-and-icon'>
        <div className={`icon-container ${iconContainerClass}`}>
          <i className={displayIconArray[index]}></i>
        </div>
        <div className={`field-and-label ${fieldClass}`}>
          <p className='test-input-field'
            id={key}>
            {displayTextArray[index]}
          </p> 
          <label className='input-label' htmlFor={key}>{displayLabelArray[index]}</label>
        </div>
      </div>
    });

    const submitClass = this.state.editing ? 'submit-warning' : '' ;

    return (
      <div className='modal-container'>
        <div className='modal-background'
          onClick={()=>{}}>
        </div>
        <div className='modal-close modal-close-test'
          onClick={e=>this.props.selectTest()}>
          <i className='fas fa-times'></i>
        </div>
        <form className='test-form' onSubmit={this.handleSubmit.bind(this)}>
          {fieldsDivs}
          {displayDivs[0]}
          {timestampEditFieldsDivs[0]}
          {displayDivs[1]}
          {timestampEditFieldsDivs[1]}
          {timestampEditFieldsDivs[2]}
          <button className={`submit-button ${submitClass}`} type="submit">
            <i className="fas fa-save"></i>
          </button>
        </form> ;        
      </div>
    );
  }

}