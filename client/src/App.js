import './App.css';
import React from 'react';
import IntakeForm from './IntakeForm';

class SpeciesSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value.toUpperCase() });
  }
  handleSubmit(event) {
    event.preventDefault();
    this.setState({ value: '' });
    console.log(this.state.value);
    fetch('/species', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        'code':this.state.value,
      }),
    }).then((response) => response.json())
      .then((json) => {
        console.log(json);
        this.setState({ critter:json });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  render() {
    const critter = this.state?.critter;
    return (
      <div>
        <header className="Critter-search">
          <form onSubmit={this.handleSubmit}>
            <label>Code: </label>
            <input type="text" value={this.state.value} onChange={this.handleChange} />
            <input type="submit" value="Submit" />
          </form>
          <div className="Critter-details">
            <p><b>Code:</b> {critter?.id}<br />
              <b>Name:</b> {critter?.name}<br />
              <b>Scientific name:</b> {critter?.sciname}<br />
              <b>Type:</b> {critter?.category?.detail}</p></div>
        </header>
      </div>
    );
  }
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.sectionChoice = this.sectionChoice.bind(this);
    this.state = {
      sectionSelect:'IntakeForm',
    };
  }

  componentDidMount() {
    fetch('/arc', {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    }).then((response) => response.json())
      .then((json) => {
        // console.log(json);
        this.setState({ arc:json });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    this.setState({ [name]: value });
  }


  sectionChoice(option) {
    switch (option) {
    case 'IntakeForm':
      return (<IntakeForm arc={this.state.arc} />);

    case 'SpeciesSearch':
      return (<SpeciesSearch />);

    default:
      return null;
    }
  }

  render() {
    return (
      <div className="App">
        <TopBar displaychoice={this.state.sectionSelect} onChange={this.handleChange} />
        {this.sectionChoice(this.state.sectionSelect)}
      </div>
    );
  }
}

class TopBar extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event);
  }

  render() {
    return (
      <div className="TopBar">
        <div className="TopBar-item">
          <select name="sectionSelect" value={this.props.displaychoice} onChange={this.handleChange}>
            <option value="SpeciesSearch">Species Lookup</option>
            <option value="IntakeForm">Intake Form</option>
            <option value="MedBoard">Med Board</option>
          </select></div>
        <div className="TopBar-item"><h1 className="TopBar-title">ARC-MED</h1></div>
        <div className="TopBar-item"><Clock /></div>
      </div>
    );
  }
}

class Clock extends React.Component {
  constructor(props) {
    super(props);
    this.state = { date: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) };
    this.tock = false;
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    if (this.tock) {
      this.setState({
        date: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
      });
      this.tock = false;
    } else {
      this.setState({
        date: new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }).replace(':', ' '),
      });
      this.tock = true;
    }
  }

  render() {
    return (
      <div className="Clock">
        <h2>{this.state.date}</h2>
      </div>
    );
  }
}


export default App;
