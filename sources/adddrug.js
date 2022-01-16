const db = require('../database.js');
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


// eslint-disable-next-line no-unused-vars
async function doThing() {
  await sleep(1500);

  const entry = {
    'arcname':'meta',
    'genericname':'Meloxicam',
    'brands':['Rheumocam', 'Metacam'],
    'type':'painkiller',
    'options':[
      { 'type':'liquid', 'amount':1.5, 'route':'PO' },
      { 'type':'liquid', 'amount':0.5, 'route':'PO' },
      { 'type':'liquid', 'amount':5, 'route':'SQ, IM, IV' },
      { 'type':'tablet', 'amount':1, 'route':'PO' },
      { 'type':'tablet', 'amount':2.5, 'route':'PO' },
      { 'type':'tablet', 'amount':7, 'route':'PO' },
    ],
    'dose':{
      'general':{ 'low':0.1, 'high':3 },
      'bird':{ 'low':0.5, 'high':2 },
      'mammal':{ 'loading':0.3, 'low':0.1, 'high':0.1 },
      'rodent':{ 'low':1, 'high':1 },
    },
  };
  await db.insert(entry, 'arcname', 'drugs');
  // console.log(JSON.stringify(entry, '', 2));
}


// doThing();

const entry = {
  'arcname':'',
  'genericname':'',
  'brands':[],
  'type':'',
  'options':[],
  'dose':{
    'general':{
      'loading':1,
      'low':0.1,
      'high':3,
    },
  },
};

(async () => {
  await sleep(1000);
  const prompt = require('prompt-sync')({ sigint: true });
  let exit = false;
  while (!exit) {
    entry.arcname = prompt('Arc name:');
    console.log(entry.arcname);
    entry.genericname = prompt('Generic name:');
    console.log(entry.genericname);
    let input1 = '';
    let i = 0;
    while (input1 != 'done') {
      input1 = prompt('Brand name (or \'done\')');
      if (input1 != 'done') {
        entry.brands[i] = input1;
        i++;
      }
    }
    console.log(entry.brands);
    entry.type = prompt('drug type(antibiotic, painkiller, etc):');
    console.log(entry.type);
    let input2 = '';
    let j = 0;
    while (input2 != 'done') {
      input2 = prompt('drug type(capsule, tablet, liquid) or \'done\':');
      if (input2 != 'done') {
        const option = {
          type:input2,
        };
        option.amount = parseFloat(prompt('dose - int, mg/ml or mg/pill:'));
        option.route = prompt('route(s) of administration:').toUpperCase();
        console.log(option);
        entry.options[j] = option;
        j++;
      }
    }
    console.log(entry.options);
    entry.dose.general.loading = parseFloat(prompt('general loading dose:'));
    entry.dose.general.high = parseFloat(prompt('general high dose:'));
    entry.dose.general.low = parseFloat(prompt('general low dose:'));
    entry.dose.general.schedule = prompt('general dosing schedule:').toUpperCase();
    entry.dose.general.doses = parseInt(prompt('general # of doses:'));
    let input3;
    while (input3 != 'done') {
      input3 = prompt('animal group to specify dose info for (or \'done\'):');
      if (input3 != 'done') {
        entry.dose[input3] = {};
        entry.dose[input3].loading = parseFloat(prompt(`loading dose for ${input3}:`));
        entry.dose[input3].high = parseFloat(prompt(`high dose for ${input3}:`));
        entry.dose[input3].low = parseFloat(prompt(`low dose for ${input3}:`));
        entry.dose[input3].schedule = prompt(`dosing schedule for ${input3}:`).toUpperCase();
        entry.dose[input3].doses = parseInt(prompt(`# of doses for ${input3}:`));
      }
    }
    console.log(entry.dose);
    prompt('Press enter to continue...');
    console.log(entry);
    const check = prompt('Is this acceptable? y/n:').toLowerCase();
    if (check.startsWith('y')) {
      await db.insert(entry, 'arcname', 'drugs');
    }
    const check2 = prompt('exit now? y/n:');
    if (check2.startsWith('y')) {
      db.closeDB();
      exit = true;
    }
  }
})();