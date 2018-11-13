import React, { Component } from 'react';
import './App.css';
import Navi from './components/Navi';
import Footer from './components/Footer';
import Hramap from './components/Map';

class App extends Component {
  constructor(props) {
    super (props); // Required to call original constructor

    this.state = {
      title: "HRA"
    }
  }
  render() {
    return (
      <div className="App">
        <Navi title={this.state.title}/>
        <Hramap />
        <Footer />
      </div>
    );
  }
}

export default App;
