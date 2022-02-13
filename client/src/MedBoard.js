import './App.css';
import React from 'react';

function genDateStr() {
  const date = new Date();
  let month = (date.getMonth() + 1).toString();
  if (month.length == 1) {month = '0' + month;}
  let day = date.getDate().toString();
  if (day.length == 1) {day = '0' + day;}
  return `${date.getFullYear()}-${month}-${day}`;
}

class MedBoard extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      day:genDateStr(),
      time:'AM',
      date:genDateStr() + '-AM',
      response:{},
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state);
    fetch('./board', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    }).then((response) => response.json())
      .then((json) => {
        // console.log(json);
        this.setState({ response:json });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    switch (name) {
    case 'day':
      this.setState({ day:value, date:`${value}-${this.state.time}` });
      break;

    case 'time':
      this.setState({ time:value, date:`${this.state.day}-${value}` });
      break;

    default:
      this.setState({ [name]: value });
      break;
    }
  }

  render() {
    return (
      <div>
        <form className="Board-form" onSubmit={this.handleSubmit}>
          <label>Meds for </label>
          <input name="day" type="date" value={this.state.day} onChange={this.handleChange} />
          <select name="time" value={this.state.time} onChange={this.handleChange} >
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
          <input type="submit" value="Go" />
        </form>
      </div>
    );
  }
}

export default MedBoard;