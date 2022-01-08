import './App.css';
import React from 'react';
import * as regex from './regexes.js';
const arc = require('./arc.json');

// eslint-disable-next-line no-unused-vars
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

function App() {
  return (
    <div className="App">
      <TopBar />
      <IntakeForm />
    </div>
  );
}

class TopBar extends React.Component {
  render() {
    return (
      <div className="TopBar">
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

class IntakeForm extends React.Component {
  constructor(props) {
    super(props);
    const date = new Date();
    let month = (date.getMonth() + 1).toString();
    if (month.length == 1) {month = '0' + month;}
    let day = date.getDate().toString();
    if (day.length == 1) {day = '0' + day;}
    const datestr = `${date.getFullYear()}-${month}-${day}`;
    this.initialState = {
      year: 22,
      id: '',
      species: '',
      weight: '',
      weightunit: 'grams',
      weightdate: datestr,
      locarea: '',
      locroom:'',
      loccage:'',
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    switch (name) {
    case 'species':
      if (regex.species.test(value)) {this.setState({ [name]: value.toUpperCase() });}
      break;

    case 'year':
      if (regex.year.test(value)) {this.setState({ [name]: value });}
      break;

    case 'weight':
      if (regex.weight.test(value)) {this.setState({ [name]: value });}
      break;

    default:
      this.setState({ [name]: value });
      break;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    // const target = event.target;
    // const name = target.name;
    // this.setState({ [name]: this.initialState[name] });
    console.log(this.state);
  }

  render() {
    return (
      <div >
        <form className="Intake-form" onSubmit={this.handleSubmit}>
          <div>
            <label>Case #: </label>
            <input className="Intake-year" name="year" type="text" value={this.state.year} onChange={this.handleChange} />
              -
            <input className="Intake-id" name="id" type="text" value={this.state.case} onChange={this.handleChange} autoComplete="off" />
          </div>
          <div>
            <label>Species: </label>
            <input className="Intake-species" name="species" type="text" value={this.state.species} onChange={this.handleChange} />
          </div>
          <div>
            <label>Weight: </label>
            <input className="Intake-weight" name="weight" type="text" value={this.state.weight} onChange={this.handleChange} />
            <select name="weightunit" value={this.state.weightunit} onChange={this.handleChange}>
              <option value="grams">Grams</option>
              <option value="kilos">Kilograms</option>
            </select>
            <input className="Intake-weight-date" name="weightdate" type="date" value={this.state.weightdate} onChange={this.handleChange} />
          </div>
          <div>
            <label>Location: </label>
            <select name="locarea" value={this.state.locarea} onChange={this.handleChange}>
              <Locoptions stage="areas" />
            </select>
            <select name="locroom" value={this.state.locroom} onChange={this.handleChange}>
              <Locoptions stage="rooms" value={this.state.locarea}/>
            </select>
            <select name="loccage" value={this.state.loccage} onChange={this.handleChange}>
              <Locoptions stage="cages" value={this.state.locroom} />
            </select>
          </div>
          <input type="submit" value="Submit" />

        </form>
      </div>
    );
  }
}

function Locoptions(props) {
  switch (props.stage) {
  case 'areas':
    return (
      <React.Fragment>
        {arc.areas.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );


  default:
    if (props.value && arc[props.stage][props.value]) {
      return (
        <React.Fragment>
          {arc[props.stage][props.value].map(element => (
            <option value={element} key={element}>{element}</option>
          ))

          }
        </React.Fragment>
      );
    } else {return null;}
  }
}

// eslint-disable-next-line no-unused-vars
class MedForm extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      year: 22,
      id: '',
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;
    switch (name) {
    case 'species':
      break;

    default:
      this.setState({ [name]: value });
      break;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    // const target = event.target;
    // const name = target.name;
    // this.setState({ [name]: this.initialState[name] });
    console.log(this.state);
  }

  render() {
    return (
      <div >
        <form className="Intake-form" onSubmit={this.handleSubmit}>
          <div>
            <label>Case #: </label>
            <input className="Intake-year" name="year" type="text" value={this.state.year} onChange={this.handleChange} />
              -
            <input className="Intake-id" name="id" type="text" value={this.state.case} onChange={this.handleChange} autoComplete="off" />
          </div>
          <input type="submit" value="Submit" />

        </form>
      </div>
    );
  }
}

export default App;
