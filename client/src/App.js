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
      year: date.getFullYear() % 100,
      id: '',
      species: '',
      weight: '',
      weightunit: 'grams',
      weightdate: datestr,
      locarea: '',
      locroom:'',
      loccage:'',
      locroomalt:'',
      loccagealt:'',
      meds: 0,
      drugs:[],
    };
    this.initialMeds = {
      'arcname':'',
      'type':'string - capsule/tablet/liquid',
      'dose':'int -mg/ml',
      'amount':'int - round to 2 decimal places',
      'startdate':'isodate',
      'schedule':'string - BID, SID',
      'doses':'int - 10',
      'when':['date'],
      'prescribedby':'string - use initials',
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.medClick = this.medClick.bind(this);
    this.medChange = this.medChange.bind(this);
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

    case 'locarea':
      this.setState({ locarea: value });
      this.setState({ locroom: '' });
      this.setState({ loccage: '' });
      break;

    case 'locroom':
      this.setState({ locroom: value });
      this.setState({ loccage: '' });
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

  medClick() {
    this.state.drugs.push(this.initialMeds);
    this.setState({ drugs: this.state.drugs });
    this.setState({ meds: this.state.meds + 1 });
  }

  medChange(event, index) {
    console.log('medchange', event, index);
    console.log(event.target.value);
    console.log(event.target.name);
    this.state.drugs[index][event.target.name] = event.target.value;
    this.setState({ drugs: this.state.drugs });
  }

  render() {
    const meds = this.state.meds;
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
              <option value="">Area:</option>
              <Locoptions stage="areas" />
            </select>
            <select name="locroom" value={this.state.locroom} onChange={this.handleChange}>
              <option value="">Room:</option>
              <Locoptions stage="rooms" value={this.state.locarea}/>
            </select>
            <select name="loccage" value={this.state.loccage} onChange={this.handleChange}>
              <option value="">Cage:</option>
              <Locoptions stage="cages" value={this.state.locroom} />
            </select>
            <br />
            <label className="Intake-localttext">Or Manually Input: </label>
            <input className="Intake-localt" placeholder="Room" name="locroomalt" type="text" value={this.state.locroomalt} onChange={this.handleChange} />
            <input className="Intake-localt" placeholder="Cage" name="loccagealt" type="text" value={this.state.loccagealt} onChange={this.handleChange} />
          </div>
          <MedCapsule value={meds} drugs={this.state.drugs} onClick={this.medClick} onChange={this.medChange} />
          <input type="submit" value="Submit" />

        </form>
      </div>
    );
  }
}

function Locoptions(props) {

  if (props.stage == 'areas') {
    return (
      <React.Fragment>
        {arc.locations.areas.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  } else if (props.value && arc.locations[props.stage][props.value]) {
    return (
      <React.Fragment>
        {arc.locations[props.stage][props.value].map(element => (
          <option value={element} key={element}>{element}</option>
        ))

        }
      </React.Fragment>
    );
  } else {return null;}
}

class MedCapsule extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  onClick() {
    this.props.onClick();
  }

  handleChange(event, index) {
    this.props.onChange(event, index);
  }

  render() {
    const meds = [];
    for (let i = 0; i < this.props.value; i++) {
      meds.push(<MedForm key={i} id={i} drug={this.props.drugs[i]} onChange={this.handleChange} />);
    }
    return (
      <div>
        {meds}
        <button type="button" onClick={this.onClick}>Add Med</button>
      </div>
    );
  }
}

class MedForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event, this.props.id);
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
      <div className="Intake-med-box">
        <p>key: {this.props.id}</p>
        <div>
          <label>Select a drug:</label>
          <select name="arcname" value={this.props.drug.arcname} onChange={this.handleChange}>
            <option value=""></option>
            <Drugtypes />
          </select>
          <br />
          <label className="Intake-med-drugttext">Or Manually Input: </label>
          <input className="Intake-med-drugt" placeholder="Drug" name="arcname" type="text" value={this.props.drug.arcname} onChange={this.handleChange} />
        </div>
      </div>
    );
  }
}

function Drugtypes() {
  return (
    <React.Fragment>
      {arc.drugs.map(element => (
        <option value={element} key={element}>{element}</option>
      ))}
    </React.Fragment>
  );
}

export default App;
