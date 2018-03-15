import React from 'react';
import TestListItem from './components/test-list-item';
import TestModal from './components/test-modal';
import * as helpers from './components/helpers';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {
        firstName:"Brad",
        id:1,
        lastName:"Garner",
        password:"xxxxx",
        photo:null,
        timestampCreated:"2018-03-15T00:04:55.026Z",
        username:"testuser2222",
      },
      errorModal: false,
      errorModalMessage: '',
      loading: true,
      addTest: false,
      test: {},
      testsObject: {
        '1': {
          id:1,
          narrative:"description of what we are testing... we can type a lot into this field, but we don't need to.xyzabc",
          statusTest:9,
          storm:" ",
          testProfile:"profile",
          tester:"1",
          testname:"name",
          timestampCreated:"2018-03-14T16:12:58.000Z",
          timestampEnd: null,
          timestampOff: null,
          timestampOn: null,
          timestampStart:null
        }
      },
      testsArray: [
        {
          id:1,
          narrative:"description of what we are testing... we can type a lot into this field, but we don't need to.xyzabc",
          statusTest:9,
          storm:" ",
          testProfile:"profile",
          tester:"1",
          testname:"name",
          timestampCreated:"2018-03-14T16:12:58.000Z",
          timestampEnd: null,
          timestampOff: null,
          timestampOn: null,
          timestampStart:null
        }
      ],
    };
  }

  selectTest(id, index){
    // index is only used for updating the array
    this.setState({
      test: id ? this.state.testsObject[id] : {} ,
      addTest: false,
      indexCurrent: index,
    });
  }

  addTest() {
    console.log('sorry, feature not included... this is for timestamp demo only');
  }

  saveTestForm(test, index){
    console.log('test to save', test)
    if(!test || typeof test !== 'object') return;

    const testsArray = 
      !isNaN(index) ? // if an index, it is existing; insert don't add
      helpers.immutableArrayInsert(index, this.state.testsArray, test) :
      [test, ...this.state.testsArray];
      this.setState({
        test,
        testsArray,
        testsObject: {...this.state.testsObject, [test.id]: test },
      });
  }

  render() {
    
    const testListItems = this.state.testsArray.map((test, index)=>{
      return <TestListItem
        key={index} 
        index={index}
        test={test} 
        selectTest={this.selectTest.bind(this)}/>
    });

    const testsList = testListItems.length > 0 ?
      <table className='table-of-tests'>
        <thead className='table-of-tests-header'>
          <tr>
            <th className='test-list-status'></th>
            <th className='test-list-name'>Name</th>
            <th className='test-list-profile'>Profile</th>
            <th className='test-list-narrative'>Description</th>
            <th className='test-list-storm'>Storm</th>
            <th className='test-list-date'>Date</th>
            <th className='test-list-tester'></th>
          </tr>
        </thead>
        <tbody>
          {testListItems}
        </tbody>
      </table> : null ;

    const testAdd = this.state.user ?
      <div className='add-test-button-container'>
        <button className='add-test-button'
          onClick={this.addTest.bind(this)}>
            <i className="fas fa-plus"></i>
        </button>
      </div> : null ;

    const testModal = this.state.test.id || this.state.addTest ? 
      <TestModal 
        test={this.state.test} 
        user={this.state.user}  
        index={this.state.indexCurrent} // only used for updating array
        saveTestForm={this.saveTestForm.bind(this)}
        selectTest={this.selectTest.bind(this)} /> : null ;

    return (
      <main className='main'>
        {testsList}
        {testAdd}
        {testModal}
      </main>
    );
  }
}