import React, { Component } from 'react';
import './App.css';
import Navi from './components/Navi';
import Footer from './components/Footer';
import Riskmap from './components/Map';

class App extends Component {
  constructor(props) {
    super (props); // Required to call original constructor
    this.state = {
      title: "Habitat Risk Assessment"
    }
  }
  render() {
    return (
      <div className="App">
        <Navi title={this.state.title}/>
        <Riskmap />
        <Footer />
      </div>
    );
  }
}

export default App;
