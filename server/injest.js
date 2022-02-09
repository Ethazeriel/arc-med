const db = require('./database.js');
const { logLine, logDebug } = require('./logger.js');
const { regexes } = require('./regexes.js');
const arc = require('./arc.json');

async function injest(newpatient) {
  const safepatient = {};

  const year = Number(newpatient?.year);
  if (!regexes.year.test(year)) {return { status:'error', error:'Invalid year' };}
  safepatient.year = year;

  const id = newpatient?.id?.replace(regexes.sanitize, '').trim();
  if (!regexes.id.test(id)) {return { status:'error', error:'Invalid id' };}
  const idmatch = id.match(/^([\d]{4})([a-z]?)$/);
  safepatient.id = Number(idmatch[1]);
  if (idmatch[2]) {safepatient.family = idmatch[2];}

  const preexisting = null;// await db.get({ $and: [{ year: newpatient.year }, { id: newpatient.id }] }, 'patients');
  if (preexisting) {logLine('info', [`${year}-${id} already exists, updating existing file`]);}
  // TODO - REMEMBER TO DO THIS

  const species = newpatient?.species?.replace(regexes.sanitize, '').trim();
  if (!regexes.species.test(species)) {return { status:'error', error:'Invalid species' };}
  const speciestest = await db.get({ id:species }, 'species');
  if (!speciestest) {return { status:'error', error:'Species not in database' };}
  safepatient.species = species;

  const weightdate = newpatient?.weightdate?.replace(regexes.sanitize, '').trim();
  const weight = Number(newpatient?.weight);
  if (!regexes.weightdate.test(weightdate)) {return { status:'error', error:'Invalid weight datestamp' };}
  if (!regexes.float.test(weight)) {return { status:'error', error:'Invalid weight value' };}
  safepatient.weight = {
    timestamp: weightdate,
    kilos: weight,
  };

  const locarea = newpatient?.locarea?.replace(regexes.sanitize, '').trim();
  const locroom = newpatient?.locroom?.replace(regexes.sanitize, '').trim() || newpatient?.locroomalt?.replace(regexes.sanitize, '').trim();
  const loccage = newpatient?.loccage?.replace(regexes.sanitize, '').trim() || newpatient?.loccagealt?.replace(regexes.sanitize, '').trim();
  if (!regexes.alphanum.test(locarea)) {return { status:'error', error:'Invalid Location (area)' };}
  if (!regexes.alphanum.test(locroom)) {return { status:'error', error:'Invalid Location (room)' };}
  if (!regexes.alphanum.test(loccage)) {return { status:'error', error:'Invalid Location (cage)' };}
  safepatient.location = {
    area: locarea,
    room: locroom,
    cage: loccage,
  };

  const intakeWR = newpatient?.intakeWR?.replace(regexes.sanitize, '').trim();
  if (!regexes.WR.test(intakeWR)) {return { status:'error', error:'Invalid Intake WR' };}
  safepatient.intakeWR = intakeWR;

  safepatient.drugs = [];
  let drugindex = 0;
  if (!Array.isArray(newpatient.drugs)) {return { status:'error', error:'Invalid drug array' };}
  for (const newdrug of newpatient.drugs) {
    if (!newdrug.what) {return { status:'error', error:`Invalid type for drug ${drugindex + 1}` };}
    switch (newdrug.what) {

    case 'drug':
      try {
        const safedrug = processDrug(newdrug);
        safepatient.drugs.push(safedrug);
      } catch (error) { return { status:'error', error:`${error.message} at drug ${drugindex + 1}` }; }
      break;

    case 'fluid':
      try {
        const safedrug = processFluid(newdrug);
        safepatient.drugs.push(safedrug);
      } catch (error) { return { status:'error', error:`${error.message} at drug ${drugindex + 1}` }; }
      break;

    case 'eyemed':
      try {
        const safedrug = processEyemed(newdrug);
        safepatient.drugs.push(safedrug);
      } catch (error) { return { status:'error', error:`${error.message} at drug ${drugindex + 1}` }; }
      break;

    default:
      return { status:'error', error:`Invalid type for drug ${drugindex + 1}` };
    }
    drugindex++;
  }

  logDebug(safepatient);
  await db.insertPatient(safepatient);
  return { status:'success', value:'Valid Intake' };
}
exports.injest = injest;

function processDrug(newdrug) {
  let safedrug = { what: 'drug' };

  const arcname = newdrug?.arcname?.replace(regexes.sanitize, '').trim();
  if (!regexes.alphanum.test(arcname)) {Error('Invalid arcname');}
  safedrug.arcname = arcname;

  const type = newdrug?.type?.replace(regexes.sanitize, '').trim();
  if (!regexes.drugtype.test(type)) {Error('Invalid type');}
  safedrug.type = type;

  const dose = Number(newdrug?.dose);
  if (!regexes.float.test(dose)) {Error('Invalid dose');}
  safedrug.dose = dose;

  const amount = Number(newdrug?.amount);
  if (!regexes.float.test(amount)) {Error('Invalid amount');}
  safedrug.amount = amount;

  const route = newdrug?.route?.replace(regexes.sanitize, '').trim();
  if (!regexes.alphanum.test(route)) {Error('Invalid route');}
  safedrug.route = route;

  const drugWR = newdrug?.prescribedby?.replace(regexes.sanitize, '').trim();
  if (!regexes.WR.test(drugWR)) {Error('Invalid WR');}
  safedrug.prescribedby = drugWR;

  safedrug = doSchedule(safedrug, newdrug);
  safedrug.done = false;
  return safedrug;
}

function processFluid(newdrug) {
  let safedrug = { what: 'fluid' };

  const name = newdrug?.name?.replace(regexes.sanitize, '').trim();
  if (!arc.fluids.includes(name)) {Error('Invalid fluid type');}
  safedrug.name = name;

  const additions = newdrug?.additions?.replace(regexes.sanitize, '').trim();
  if (!regexes.fluidextra.test(additions)) {Error('Invalid fluid addition');}
  safedrug.additions = additions.length ? additions : null;

  const percent = Number(newdrug?.percentBW);
  if (!regexes.float.test(percent)) {Error('Invalid percentage');}
  safedrug.percent = percent;

  const amount = Number(newdrug?.amount);
  if (!regexes.float.test(amount)) {Error('Invalid quantity');}
  safedrug.amount = amount;

  const route = newdrug?.route?.replace(regexes.sanitize, '').trim();
  if (!regexes.alphanum.test(route)) {Error('Invalid route');}
  safedrug.route = route;

  const drugWR = newdrug?.prescribedby?.replace(regexes.sanitize, '').trim();
  if (!regexes.WR.test(drugWR)) {Error('Invalid WR');}
  safedrug.prescribedby = drugWR;

  safedrug = doSchedule(safedrug, newdrug);
  safedrug.done = false;
  return safedrug;
}

function processEyemed(newdrug) {
  let safedrug = { what: 'eyemed' };

  const name = newdrug?.name?.replace(regexes.sanitize, '').trim();
  if (!arc.eyemeds.includes(name)) {Error('Invalid eyemed type');}
  safedrug.name = name;

  const route = newdrug?.route?.replace(regexes.sanitize, '').trim();
  if (!arc.routes.eyes.includes(route)) {Error('Invalid route');}
  safedrug.route = route;

  safedrug = doSchedule(safedrug, newdrug);
  safedrug.done = false;
  return safedrug;
}

function doSchedule(safedrug, newdrug) {

  const dosemode = newdrug?.mode?.replace(regexes.sanitize, '').trim();
  if (!regexes.dosemode.test(dosemode)) {Error('Invalid dosing mode');}
  if (dosemode === 'auto') {

    safedrug.dosemode = dosemode;

    const startdate = newdrug?.startdate?.replace(regexes.sanitize, '').trim();
    if (!regexes.weightdate.test(startdate)) {Error('Invalid start datestamp');}
    const starttime = newdrug?.starttime?.replace(regexes.sanitize, '').trim();
    if (!regexes.time.test(starttime)) {Error('Invalid start timestamp');}
    safedrug.startdate = `${startdate}-${starttime}`;

    const schedule = newdrug?.schedule?.replace(regexes.sanitize, '').trim();
    if (!arc.schedules.includes(schedule)) {Error('Invalid schedule');}
    safedrug.schedule = schedule;

    const doses = Number(newdrug?.doses);
    if (!regexes.int.test(doses)) {Error('Invalid number of doses');}
    safedrug.doses = doses;

    safedrug.when = generateWhen(safedrug.startdate, schedule, doses);

  } else {

    safedrug.dosemode = dosemode;

    const when = [];
    if (!Array.isArray(newdrug?.when)) {Error('Invalid dose array');}
    for (const element of newdrug.when) {
      const date = element?.date?.replace(regexes.sanitize, '').trim();
      if (!regexes.weightdate.test(date)) {Error('Invalid datestamp');}
      const time = element?.time?.replace(regexes.sanitize, '').trim();
      if (!regexes.time.test(time)) {Error('Invalid timestamp');}
      when.push(`${date}-${time}`);
    }
    safedrug.when = when;

  }
  return safedrug;
}

function generateWhen(date, schedule, doses) {
  // eslint-disable-next-line prefer-const
  let [, year, month, day, time] = date.match(regexes.datematch);
  let stripped = `${year}-${month}-${day}`;
  const result = [date];
  switch (schedule) {

  case 'OD':
    return result;

  case 'SID':
    for (let i = 1; i < doses; i++) {
      date = `${nextDay(date)}-${time}`;
      result.push(date);
    }
    return result;

  case 'BID':
    for (let i = 1; i < doses; i++) {
      date = (time === 'AM') ? `${stripped}-${time = 'PM'}` : `${stripped = nextDay(stripped)}-${time = 'AM'}`;
      result.push(date);
    }
    return result;

  case 'TID': // we're not actually handling this right now
    for (let i = 1; i < doses; i++) {
      date = (time === 'AM') ? `${stripped}-${time = 'PM'}` : `${stripped = nextDay(stripped)}-${time = 'AM'}`;
      result.push(date);
    }
    return result;

  case 'QID': // or this
    for (let i = 1; i < doses; i++) {
      date = (time === 'AM') ? `${stripped}-${time = 'PM'}` : `${stripped = nextDay(stripped)}-${time = 'AM'}`;
      result.push(date);
    }
    return result;

  case 'EOD':
    for (let i = 1; i < doses; i++) {
      date = nextDay(date);
      date = `${nextDay(date)}-${time}`;
      result.push(date);
    }
    return result;

  case 'E3D':
    for (let i = 1; i < doses; i++) {
      date = nextDay(date);
      date = nextDay(date);
      date = `${nextDay(date)}-${time}`;
      result.push(date);
    }
    return result;

  case 'E4D':
    for (let i = 1; i < doses; i++) {
      date = nextDay(date);
      date = nextDay(date);
      date = nextDay(date);
      date = `${nextDay(date)}-${time}`;
      result.push(date);
    }
    return result;

  }
}

function nextDay(date) {
  let [, year, month, day] = date.match(regexes.datematch);
  const monthLength = {
    '01':31,
    '02':(year % 400 === 0) ? 29 : ((year % 100 === 0) ? 28 : ((year % 4 === 0) ? 29 : 28)),
    '03':31,
    '04':30,
    '05':31,
    '06':30,
    '07':31,
    '08':31,
    '09':30,
    '10':31,
    '11':30,
    '12':31,
  };
  if (month == 12 && day == 31) {
    year = (Number(year) + 1);
    return `${year}-01-01`;
  } else if (day == monthLength[month]) {
    month = (Number(month) + 1).toString();
    if (month.length == 1) {month = '0' + month;}
    return `${year}-${month}-01`;
  } else {
    day = (Number(day) + 1).toString();
    if (day.length == 1) {day = '0' + day;}
    return `${year}-${month}-${day}`;
  }
}
