import './App.css';
import React from 'react';

class SpeciesSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value.toUpperCase()});
  }
  handleSubmit(event) {
    event.preventDefault();
    this.setState({value: ''})
    console.log(this.state.value);
    fetch("/species", {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        'code':this.state.value
      })
    }).then((response) => response.json())
    .then((json) => {
      console.log(json);
      this.setState({critter:json});
    })
    .catch((error) => {
      console.error(error);
    });
  }

  render() {
    const critter = this.state?.critter;
    return (
      <div className="App">
        <header className="App-header">
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
    )
  }
}

function App() {
  return (
    null
  );
}



export default App;
export {SpeciesSearch};
