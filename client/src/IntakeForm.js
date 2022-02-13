import './App.css';
import React from 'react';
import * as regex from './regexes.js';

function genDateStr() {
  const date = new Date();
  let month = (date.getMonth() + 1).toString();
  if (month.length == 1) {month = '0' + month;}
  let day = date.getDate().toString();
  if (day.length == 1) {day = '0' + day;}
  return `${date.getFullYear()}-${month}-${day}`;
}

class IntakeForm extends React.Component {
  constructor(props) {
    super(props);
    const datestr = genDateStr();
    const date = new Date();
    this.initialState = {
      year: date.getFullYear() % 100,
      id: '',
      species: '',
      weight: '',
      dispweight: '',
      weightunit: 'grams',
      weightdate: datestr,
      locarea: '',
      locroom:'',
      loccage:'',
      locroomalt:'',
      loccagealt:'',
      drugs:[],
      addType:'drug',
      intakeWR:'',
      response: {},
    };
    this.initialMeds = {
      'what':'drug',
      'arcname':'',
      'type':'',
      'dose':'',
      'amount':'',
      'route':'',
      'startdate':datestr,
      'starttime':'AM',
      'schedule':'',
      'doses':1,
      'when':[],
      'prescribedby':'',
      'mode':'auto',
    };
    this.initialFluids = {
      'what':'fluid',
      'name':'',
      'additions':'',
      'percentBW':2,
      'amount':'',
      'route':'',
      'startdate':datestr,
      'starttime':'AM',
      'schedule':'',
      'doses':1,
      'when':[],
      'prescribedby':'',
      'mode':'auto',
    };
    this.initialEyes = {
      'what':'eyemed',
      'name':'',
      'route':'',
      'startdate':datestr,
      'starttime':'AM',
      'schedule':'',
      'doses':1,
      'when':[],
      'prescribedby':'',
      'mode':'auto',
    };
    this.initialWhen = {
      'date':datestr,
      'time':'AM',
    };
    this.state = this.initialState;
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.medClick = this.medClick.bind(this);
    this.medChange = this.medChange.bind(this);
    this.schChange = this.schChange.bind(this);
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

    case 'dispweight':
      if (regex.float.test(value)) {this.setState({ [name]: value });}
      this.setState({ weight: (this.state.weightunit === 'grams') ? parseFloat(value / 1000) : parseFloat(value) });
      break;

    case 'weightunit':
      this.setState({ [name]: value });
      this.setState({ weight: (value === 'grams') ? parseFloat(this.state.dispweight / 1000) : parseFloat(this.state.dispweight) });
      break;

    case 'locarea':
      this.setState({ locarea: value });
      this.setState({ locroom: '' });
      this.setState({ loccage: '' });
      break;

    case 'locroom':
      this.setState({ locroom: value });
      this.setState({ loccage: '' });
      this.setState({ locroomalt: '' });
      break;

    case 'loccage':
      this.setState({ loccage: value });
      this.setState({ loccagealt: '' });
      break;

    case 'locroomalt':
      this.setState({ locroomalt: value });
      this.setState({ locroom: '' });
      this.setState({ loccage: '' });
      break;

    case 'loccagealt':
      this.setState({ loccagealt: value });
      this.setState({ loccage: '' });
      break;

    case 'intakeWR':
      this.setState({ intakeWR: value });
      this.initialEyes.prescribedby = value;
      this.initialFluids.prescribedby = value;
      this.initialMeds.prescribedby = value;
      break;

    default:
      this.setState({ [name]: value });
      break;
    }
  }

  handleSubmit(event) {
    event.preventDefault();
    console.log(this.state);
    fetch('/intake', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state),
    }).then((response) => response.json())
      .then((json) => {
        console.log(json);
        this.setState({ response:json });
      })
      .catch((error) => {
        console.error(error);
      });
  }

  medClick(event, index) {
    // console.log(event.target.name, index);
    this.setState(state => {
      let drugs = state.drugs;
      switch (event.target.name) {

      case 'addMed':
        switch (this.state.addType) {
        case 'drug':
          drugs = state.drugs.concat(Object.assign({}, this.initialMeds));
          break;

        case 'fluid':
          drugs = state.drugs.concat(Object.assign({}, this.initialFluids));
          break;

        case 'eyemed':
          drugs = state.drugs.concat(Object.assign({}, this.initialEyes));
          break;
        }
        break;

      case 'delMed':
        drugs = state.drugs.filter((drug, jndex) => index !== jndex);
        break;

      case 'addDose':
        drugs = state.drugs.map((drug, jndex) => {
          if (jndex === index) {
            const moddrug = Object.assign({}, drug);
            moddrug.when = drug.when.concat(Object.assign({}, this.initialWhen));
            return moddrug;
          } else { return drug; }
        });
        break;

      case 'removeDose':
        drugs = state.drugs.map((drug, jndex) => {
          if (jndex === index) {
            const moddrug = Object.assign({}, drug);
            moddrug.when = drug.when.filter((entry, kndex) => kndex !== (drug.when.length - 1));
            return moddrug;
          } else { return drug; }
        });
        break;

      case 'mode':
        drugs = state.drugs.map((drug, jndex) => {
          if (jndex === index) {
            const moddrug = Object.assign({}, drug);
            moddrug.mode = (moddrug.mode === 'auto') ? 'manual' : 'auto';
            return moddrug;
          } else { return drug; }
        });
        break;
      }

      return { drugs };
    });
  }

  medChange(event, index) {
    // console.log(`medchange index ${index}, name ${event.target.name}, value ${event.target.value}`, event);
    if (event.target.name == 'addType') {
      this.setState({ 'addType': event.target.value });
    } else {
      this.setState(state => {
        const drugs = state.drugs.map((drug, jndex) => {
          if (jndex === index) {
            const moddrug = Object.assign({}, drug); // remember this is a shallow copy and will break, will need to special case for nested arrays and objects
            switch (drug.what) {
            case 'drug': {
              switch (event.target.name) {

              case 'dose':
                if (regex.float.test(event.target.value)) {
                  // eslint-disable-next-line no-case-declarations
                  const dose = event.target.value;
                  moddrug[event.target.name] = dose;
                  if (regex.concentration.test(drug.type)) {
                    // eslint-disable-next-line no-case-declarations
                    const concentration = drug.type.match(regex.concentration);
                    moddrug.amount = Math.round((this.state.weight * dose / concentration[2]) * 100) / 100;
                    moddrug.amount = (moddrug.amount === 0) ? 0.01 : moddrug.amount;
                  }
                }
                break;

              case 'type':
                // console.log('event');
                moddrug[event.target.name] = event.target.value;
                if (regex.concentration.test(event.target.value)) {
                  // eslint-disable-next-line no-case-declarations
                  const concentration = event.target.value.match(regex.concentration);
                  moddrug.amount = Math.round((this.state.weight * drug.dose / concentration[2]) * 100) / 100;
                  moddrug.amount = (moddrug.amount === 0) ? 0.01 : moddrug.amount;
                }
                break;

              case 'doses':
                if (regex.int.test(event.target.value)) {
                  moddrug[event.target.name] = event.target.value;
                }
                break;

              default:
                moddrug[event.target.name] = event.target.value;
                break;
              }
              break;
            }

            case 'fluid': {
              switch (event.target.name) {

              case 'percentBW':
                if (regex.float.test(event.target.value)) {
                  moddrug[event.target.name] = event.target.value;
                  moddrug.amount = ((this.state.weight * 1000) * (event.target.value / 100));
                }
                break;

              case 'amount':
                if (event.target.value === 'load') {
                  moddrug.amount = ((this.state.weight * 1000) * (2 / 100));
                } else if (regex.float.test(event.target.value)) {
                  moddrug[event.target.name] = event.target.value;
                }
                break;

              case 'doses':
                if (regex.int.test(event.target.value)) {
                  moddrug[event.target.name] = event.target.value;
                }
                break;

              default:
                moddrug[event.target.name] = event.target.value;
                break;
              }
              break;
            }

            case 'eyemed': {
              switch (event.target.name) {

              case 'doses':
                if (regex.int.test(event.target.value)) {
                  moddrug[event.target.name] = event.target.value;
                }
                break;

              default:
                moddrug[event.target.name] = event.target.value;
                break;
              }
              break;
            }
            }

            return moddrug;
          } else {
            return drug;
          }
        });
        return { drugs };
      });
    }
  }

  schChange(event, outerindex, innerindex) {
    this.setState(state => {
      let drugs = state.drugs;
      drugs = state.drugs.map((drug, jndex) => {
        if (jndex === outerindex) {
          const moddrug = Object.assign({}, drug);
          let when = moddrug.when;
          when = moddrug.when.map((date, kndex) => {
            if (kndex === innerindex) {
              const moddate = Object.assign({}, date);
              moddate[event.target.name] = event.target.value;
              return moddate;
            } else { return date; }
          });
          moddrug.when = when;
          return moddrug;
        } else { return drug; }
      });
      return { drugs };
    });
  }

  render() {
    return (
      <div >
        <ResponseDisplay response={this.state.response} />
        <form className="Intake-form" onSubmit={this.handleSubmit}>
          <div className="Intake-toprow">
            <div>
              <label>Case #: </label>
              <input className="Intake-year" name="year" type="text" value={this.state.year} onChange={this.handleChange} />
              -
              <input className="Intake-id" name="id" type="text" value={this.state.case} onChange={this.handleChange} autoComplete="off" />
              <br />
              <label>Species: </label>
              <input className="Intake-species" name="species" type="text" value={this.state.species} onChange={this.handleChange} />
            </div>
            <div>
              <label>Weight: </label>
              <input className="Intake-weight" name="dispweight" type="text" value={this.state.dispweight} onChange={this.handleChange} />
              <select name="weightunit" value={this.state.weightunit} onChange={this.handleChange}>
                <option value="grams">Grams</option>
                <option value="kilos">Kilograms</option>
              </select>
              <br />
              <label className="Intake-localttext">on </label>
              <input className="Intake-weight-date" name="weightdate" type="date" value={this.state.weightdate} onChange={this.handleChange} />
            </div>
            <div>
              <label>Location: </label>
              <select name="locarea" value={this.state.locarea} onChange={this.handleChange}>
                <option value="">Area:</option>
                <RenderOptions type="location" stage="areas" arc={this.props.arc} />
              </select>
              <select name="locroom" value={this.state.locroom} onChange={this.handleChange}>
                <option value="">Room:</option>
                <RenderOptions type="location" stage="rooms" value={this.state.locarea} arc={this.props.arc} />
              </select>
              <select name="loccage" value={this.state.loccage} onChange={this.handleChange}>
                <option value="">Cage:</option>
                <RenderOptions type="location" stage="cages" value={this.state.locroom} arc={this.props.arc} />
              </select>
              <br />
              <label className="Intake-localttext">Or Manually Input: </label>
              <input className="Intake-localt" placeholder="Room" name="locroomalt" type="text" value={this.state.locroomalt} onChange={this.handleChange} />
              <input className="Intake-localt" placeholder="Cage" name="loccagealt" type="text" value={this.state.loccagealt} onChange={this.handleChange} />
            </div>
            <div>
              <label className="Intake-wrtext" >Intake by:</label>
              <br />
              <select name="intakeWR" value={this.state.intakeWR} onChange={this.handleChange}>
                <option value="">...</option>
                <RenderOptions type="rehabbers" arc={this.props.arc} />
              </select>
            </div>
          </div>
          <MedCapsule drugs={this.state.drugs} arc={this.props.arc} type={this.state.addType} onClick={this.medClick} onChange={this.medChange} schChange={this.schChange}/>
          <input type="submit" value="Submit" />

        </form>
      </div>
    );
  }
}

function RenderOptions(props) {
  switch (props.type) {
  case 'location': {
    if (!props.arc) {return null;}
    if (props.stage == 'areas') {
      return (
        <React.Fragment>
          {props.arc.locations.areas.map(element => (
            <option value={element} key={element}>{element}</option>
          ))}
        </React.Fragment>
      );
    } else if (props.value && props.arc.locations[props.stage][props.value]) {
      return (
        <React.Fragment>
          {props.arc.locations[props.stage][props.value].map(element => (
            <option value={element} key={element}>{element}</option>
          ))
          }
        </React.Fragment>
      );
    } else {return null;}
  }

  case 'drug': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.drugs.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'fluid': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.fluids.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'eyemed': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.eyemeds.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'types': {
    if (!props.reference) {return null;}
    return (
      <React.Fragment>
        {props.reference.options.map((element, index) => (
          <option value={`${element.typem}*${element.amount}`} key={index}>{`${element.amount} ${(element.typem == 'liquid') ? 'mg/ml' : 'mg'} ${element.typeh}`}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'fluidroute': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.routes.fluids.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'drugroute': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.routes.drugs.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'eyeroute': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.routes.eyes.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'rehabbers': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.rehabbers.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  case 'schedules': {
    if (!props.arc) {return null;}
    return (
      <React.Fragment>
        {props.arc.schedules.map(element => (
          <option value={element} key={element}>{element}</option>
        ))}
      </React.Fragment>
    );
  }

  default: {
    return null;
  }
  }
}

class MedCapsule extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.schChange = this.schChange.bind(this);
  }

  schChange(event, outerindex, innerindex) {
    this.props.schChange(event, outerindex, innerindex);
  }

  onClick(event, index) {
    this.props.onClick(event, index);
  }

  handleChange(event, index) {
    this.props.onChange(event, index);
  }

  render() {
    const meds = [];
    for (let i = 0; i < this.props.drugs.length; i++) {
      switch (this.props.drugs[i].what) {
      case 'drug':
        meds.push(<MedForm key={i} id={i} drug={this.props.drugs[i]} arc={this.props.arc} onClick={this.onClick} onChange={this.handleChange} schChange={this.schChange} />);
        break;

      case 'fluid':
        meds.push(<FluidForm key={i} id={i} drug={this.props.drugs[i]} arc={this.props.arc} onClick={this.onClick} onChange={this.handleChange} schChange={this.schChange} />);
        break;

      case 'eyemed':
        meds.push(<EyeForm key={i} id={i} drug={this.props.drugs[i]} arc={this.props.arc} onClick={this.onClick} onChange={this.handleChange} schChange={this.schChange} />);
        break;
      }
    }
    return (
      <div>
        {meds}
        <select name="addType" value={this.props.type} onChange={this.handleChange}>
          <option value="drug">drug</option>
          <option value="fluid">fluid</option>
          <option value="eyemed">eyemed</option>
        </select>
        <button type="button" name="addMed" onClick={this.onClick}>Add</button>
      </div>
    );
  }
}

class MedForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.schChange = this.schChange.bind(this);
    this.state = {
      reference: {
        'arcname':'',
        'genericname':'',
        'brands':[],
        'type':'',
        'options':[],
        'dose':{},
      },
      selectedType: 'liquid',
    };
  }

  schChange(event, index) {
    this.props.schChange(event, this.props.id, index);
  }

  handleChange(event) {
    this.props.onChange(event, this.props.id);
    switch (event.target.name) {
    case 'arcname':
      if (this.props.arc.drugs.includes(event.target.value)) {
        fetch('/drugs', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            'code':event.target.value,
          }),
        }).then((response) => response.json())
          .then((json) => {
            // console.log(json);
            this.setState({ reference:json });
          })
          .catch((error) => {
            console.error(error);
          });
      }
      break;

    case 'type':
      if (event.target.value.startsWith('liquid')) {
        this.setState({ selectedType: 'liquid' });
      } else {this.setState({ selectedType: 'pill' });}
      break;

    default:
      break;
    }
  }

  onClick(event) {
    this.props.onClick(event, this.props.id);
  }

  render() {
    return (
      <div className="Intake-med-box">
        <div className="Intake-med-section">
          <button className="Intake-med-delbtn" type="button" name="delMed" onClick={this.onClick}>Remove</button>
        </div>
        <div className="Intake-med-section">
          <label className="Intake-med-drugstext">Tx #{this.props.id + 1}</label><br />
          <label className="Intake-med-drugrtext">{this.props.drug.what}</label><br />
        </div>
        <div className="Intake-med-section">
          <label>Drug: </label>
          <select name="arcname" value={this.props.drug.arcname} onChange={this.handleChange}>
            <option value="">Select...</option>
            <RenderOptions type="drug" arc={this.props.arc} />
          </select>
          <br />
          <label className="Intake-med-drugttext">Or Manually Input: </label>
          <input className="Intake-med-drugt" placeholder="Drug" name="arcname" type="text" value={this.props.drug.arcname} onChange={this.handleChange} />
        </div>
        <div className="Intake-med-section">
          <label>Type: </label>
          <select name="type" value={this.props.drug.type} onChange={this.handleChange}>
            <option value="">Select...</option>
            <RenderOptions type="types" reference={this.state.reference} />
          </select>
          <br />
          <label className="Intake-med-drugutext" >Dose at: </label>
          <input className="Intake-med-dose" name="dose" type="text" value={this.props.drug.dose} onChange={this.handleChange} />
          <label className="Intake-med-drugutext" >mg/kg = </label>
          <input className="Intake-med-amount" name="amount" type="text" value={this.props.drug.amount} onChange={this.handleChange} />
          <label className="Intake-med-drugutext" >{(this.state.selectedType == 'liquid') ? 'ml' : 'tabs'}</label>
        </div>
        <div className="Intake-med-section">
          <label>Route: </label>
          <select name="route" value={this.props.drug.route} onChange={this.handleChange}>
            <option value="">...</option>
            <RenderOptions type="drugroute" arc={this.props.arc} />
          </select>
          <br />
          <label className="Intake-med-drugutext">Prescribed by: </label>
          <select name="prescribedby" value={this.props.drug.prescribedby} onChange={this.handleChange}>
            <option value="">...</option>
            <RenderOptions type="rehabbers" arc={this.props.arc} />
          </select>
        </div>
        <DrugSchedule arc={this.props.arc} drug={this.props.drug} reference={this.state.reference} onChange={this.handleChange} onClick={this.onClick} schChange={this.schChange}/>
      </div>
    );
  }
}

class DrugSchedule extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.handleSchChange = this.handleSchChange.bind(this);
  }

  onClick(event) {
    this.props.onClick(event);
  }
  handleSchChange(event, index) {
    this.props.schChange(event, index);
  }

  handleChange(event) {
    this.props.onChange(event);
  }

  render() {
    let content;
    if (this.props.drug.mode === 'auto') {
      content = (
        <React.Fragment>
          <div className="Intake-med-section">
            <button className="Intake-med-modebtn" type="button" name="mode" onClick={this.onClick}>Mode</button>
          </div>
          <div className="Intake-med-section">
            <select name="schedule" value={this.props.drug.schedule} onChange={this.handleChange}>
              <option value="">...</option>
              <RenderOptions type="schedules" arc={this.props.arc} />
            </select>
            <label>For </label>
            <input className="Intake-med-doses" name="doses" type="text" value={this.props.drug.doses} onChange={this.handleChange} />
            <label> doses</label>
            <br />
            <label>Starting on </label>
            <input name="startdate" type="date" value={this.props.drug.startdate} onChange={this.handleChange} />
            <select name="starttime" value={this.props.drug.starttime} onChange={this.handleChange} >
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </React.Fragment>
      );
    } else {
      const when = [];
      for (let i = 0; i < this.props.drug.when.length; i++) {
        when.push(<ScheduleEntry key={i} id={i} when={this.props.drug.when[i]} onChange={this.handleSchChange} />);
      }
      // <EyeForm key={i} id={i} drug={this.props.drugs[i]} arc={this.props.arc} onClick={this.onClick} onChange={this.handleChange} />);
      content = (
        <>
          <div className="Intake-med-section">
            <div className="Intake-med-manual-buttons">
              <button className="Intake-med-modebtn" type="button" name="mode" onClick={this.onClick}>Mode</button>
              <button type="button" name="addDose" onClick={this.onClick}>+ dose</button>
              <button type="button" name="removeDose" onClick={this.onClick}>- dose</button>
            </div>
          </div>
          <div className="Intake-med-section">
            <div className="Intake-med-manual-cont" >
              {when}
            </div>
          </div>
        </>
      );
    }
    return (content);
  }
}

class ScheduleEntry extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.props.onChange(event, this.props.id);
  }

  render() {
    return (
      <div>
        <label className="Intake-med-scheduletext"> {this.props.id + 1}. </label>
        <input name="date" type="date" value={this.props.when.date} onChange={this.handleChange} />
        <select name="time" value={this.props.when.time} onChange={this.handleChange} >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    );
  }
}

class FluidForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.schChange = this.schChange.bind(this);
    this.state = {};
  }

  schChange(event, index) {
    this.props.schChange(event, this.props.id, index);
  }

  handleChange(event) {
    this.props.onChange(event, this.props.id);
  }

  onClick(event) {
    this.props.onClick(event, this.props.id);
  }

  componentDidMount() {
    const event = { // yes I am aware of how terrible this is
      target: {
        name: 'amount',
        value: 'load',
      },
    };
    this.props.onChange(event, this.props.id);
  }

  render() {
    return (
      <div className="Intake-med-box">
        <div className="Intake-med-section">
          <button className="Intake-med-delbtn" type="button" name="delMed" onClick={this.onClick}>Remove</button>
        </div>
        <div className="Intake-med-section">
          <label className="Intake-med-drugstext">Tx #{this.props.id + 1}</label><br />
          <label className="Intake-med-drugrtext">{this.props.drug.what}</label><br />
        </div>
        <div className="Intake-med-section">
          <label>Fluid: </label>
          <select name="name" value={this.props.drug.name} onChange={this.handleChange}>
            <option value="">Select...</option>
            <RenderOptions type="fluid" arc={this.props.arc} />
          </select>
          <br />
          <label className="Intake-med-drugutext">Additions: </label>
          <input className="Intake-med-additions" name="additions" type="text" value={this.props.drug.additions} onChange={this.handleChange} />
        </div>
        <div className="Intake-med-section">
          <label className="Intake-med-fluidutext" >% BW: </label>
          <input className="Intake-med-percent" name="percentBW" type="text" value={this.props.drug.percentBW} onChange={this.handleChange} />
          <br />
          <label className="Intake-med-fluidutext" >= </label>
          <input className="Intake-med-amount" name="amount" type="text" value={this.props.drug.amount} onChange={this.handleChange} />
          <label className="Intake-med-fluidutext" >ml</label>
        </div>
        <div className="Intake-med-section">
          <label>Route: </label>
          <select name="route" value={this.props.drug.route} onChange={this.handleChange}>
            <option value="">...</option>
            <RenderOptions type="fluidroute" arc={this.props.arc} />
          </select>
          <br />
          <label className="Intake-med-drugutext">Prescribed by: </label>
          <select name="prescribedby" value={this.props.drug.prescribedby} onChange={this.handleChange}>
            <option value="">...</option>
            <RenderOptions type="rehabbers" arc={this.props.arc} />
          </select>
        </div>
        <DrugSchedule arc={this.props.arc} drug={this.props.drug} reference={this.state.reference} onChange={this.handleChange} onClick={this.onClick} schChange={this.schChange}/>
      </div>
    );
  }
}

class EyeForm extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.onClick = this.onClick.bind(this);
    this.schChange = this.schChange.bind(this);
    this.state = {};
  }

  schChange(event, index) {
    this.props.schChange(event, this.props.id, index);
  }

  handleChange(event) {
    this.props.onChange(event, this.props.id);
  }

  onClick(event) {
    this.props.onClick(event, this.props.id);
  }

  render() {
    return (
      <div className="Intake-med-box">
        <div className="Intake-med-section">
          <button className="Intake-med-delbtn" type="button" name="delMed" onClick={this.onClick}>Remove</button>
        </div>
        <div className="Intake-med-section">
          <label className="Intake-med-drugstext">Tx #{this.props.id + 1}</label><br />
          <label className="Intake-med-drugrtext">{this.props.drug.what}</label><br />
        </div>
        <div className="Intake-med-section">
          <label>Eyemed: </label>
          <select name="name" value={this.props.drug.name} onChange={this.handleChange}>
            <option value="">Select...</option>
            <RenderOptions type="eyemed" arc={this.props.arc} />
          </select>
        </div>
        <div className="Intake-med-section">
          <label>Route: </label>
          <select name="route" value={this.props.drug.route} onChange={this.handleChange}>
            <option value="">...</option>
            <RenderOptions type="eyeroute" arc={this.props.arc} />
          </select>
          <br />
          <label className="Intake-med-drugutext">Prescribed by: </label>
          <select name="prescribedby" value={this.props.drug.prescribedby} onChange={this.handleChange}>
            <option value="">...</option>
            <RenderOptions type="rehabbers" arc={this.props.arc} />
          </select>
        </div>
        <DrugSchedule arc={this.props.arc} drug={this.props.drug} reference={this.state.reference} onChange={this.handleChange} onClick={this.onClick} schChange={this.schChange}/>
      </div>
    );
  }
}

function ResponseDisplay(props) {
  if (!Object.keys(props.response).length) {
    return (null);
  } else if (props.response.status == 'error') {
    return (<h3 className="Form-error">Submission error: {props.response.error}</h3>);
  }
  return (
    <div>
      <h3 className="Form-success">Patient Admitted.</h3>
    </div>
  );
}

export default IntakeForm;