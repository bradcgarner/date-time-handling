import React from 'react';
import UserLogin from './components/user-login';
import UserPwReset from './components/user-pw-reset';
import ErrorModal from './components/error-modal';
import LoadingModal from './components/loading-modal';
import TestListItem from './components/test-list-item';
import TestModal from './components/test-modal';
import * as helpers from './components/helpers';
import { REACT_APP_BASE_URL } from './config';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      errorModal: false,
      errorModalMessage: '',
      loading: true,
      addTest: false,
      test: {},
      testsObject: {},
      testsArray: [],
    };
  }

  initializeApp(value) {
    if(value) {
      this.listTests(20);
     } else {
      this.setState({
        user: null,
        loading: false,
      })
    }
  }

  componentDidMount(){
    this.setState({
      loading: false,
    });
  }

  login(username, password){
    this.setState({
      loading: true,
    });
    const url=`${REACT_APP_BASE_URL}/api/auth/login`
    const headers = {
      'Content-Type': 'application/json',
    }
    const init = {
      method: 'POST',
      headers,
      body: JSON.stringify({username, password}),
    }
    return fetch(url, init)
    .then(userReturned=>{
      if(!userReturned.ok){
        this.setState({
          loading: false,
        });
        return Promise.reject(userReturned.statusText);
      }
      return userReturned.json();
    })
    .then(user=>{
      this.setState({
        user: user,
      });
      this.initializeApp(true);
    })
    .catch(error=>{
      this.toggleErrorModal(`Opps! Try again. The server says: ${error}`)
    })
  }

  logout(){
    this.initializeApp(false);
    this.setState({
      user: {},
    })
    console.log('user has logged out')
  }

  toggleErrorModal(message){
    this.setState({
      errorModal: !this.state.errorModal,
      errorModalMessage: message,
    })
  }

  toggleLoadingModal(value){
    this.setState({
      loading: value,
    })
  }

  listTests(howMany){
    this.setState({
      loading: true,
    });
    const url=`${REACT_APP_BASE_URL}/api/tests`
    const headers = {
      'Bearer' : this.state.user.authToken,
    }
    const init = {
      headers,
    }

    return fetch(url, init)
    .then(testsReturned=>{
      if(!testsReturned.ok){
        this.setState({
          loading: false,
        });
        return Promise.reject(testsReturned.statusText);
      }
      return testsReturned.json();
    })
    .then(testsList=>{
      this.setState({
        testsArray: testsList.testsArray,
        testsObject: testsList.testsObject,
        loading: false,
      });
    })
    .catch(error=>{
      this.toggleErrorModal(`Opps! Something went wrong. The server says: ${error}`)
    })
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
    this.setState({addTest: true});
  }

  saveTestForm(test, index){
    console.log('test to save', test)
    if(!test || typeof test !== 'object') return;
    
    this.setState({
      loading: true,
    });
    const params = test.id ? `/${test.id}` : '' ;
    const method = test.id ? 'PUT' : 'POST' ;
    const url=`${REACT_APP_BASE_URL}/api/tests${params}`
    const headers = {
      'Content-Type': 'application/json',
      'Bearer' : this.state.user.authToken,
    }
    const init = {
      method,
      headers,
      body: JSON.stringify(test),
    }

    return fetch(url, init)
    .then(testReturned=>{
      if(!testReturned.ok){
        this.setState({
          loading: false,
        });
        return Promise.reject(testReturned.statusText);
      }
      return testReturned.json();
    })
    .then(test=>{
      console.log('test returned', test)
      const testsArray = 
        !isNaN(index) ? // if an index, it is existing; insert don't add
        helpers.immutableArrayInsert(index, this.state.testsArray, test) :
        [test, ...this.state.testsArray];
      console.log('testsArray',testsArray);
      this.setState({
        test,
        testsArray,
        testsObject: {...this.state.testsObject, [test.id]: test },
        loading: false,
      });
    })
    .catch(error=>{
      this.toggleErrorModal(`Opps! Something went wrong. The server says: ${error}`)
    })
  }

  render() {

    const login = this.state.user ? null :
      <div className='loginContainer'>
        <UserLogin
          login={this.login.bind(this)}
          toggleErrorModal={this.toggleErrorModal.bind(this)}/>
        <UserPwReset/>
      </div> ;
    
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

    const errorModal = this.state.errorModal ? 
      <ErrorModal
        message={this.state.errorModalMessage}
        toggleErrorModal={this.toggleErrorModal.bind(this)}
      /> : null ;

    const loading = this.state.loading ? 
      <LoadingModal/> : null ;

    return (
      <main className='main'>
        {login}
        {testsList}
        {testAdd}
        {testModal}
        {errorModal}
        {loading}
      </main>
    );
  }
}