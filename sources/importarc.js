const fs = require('fs');
const db = require('../database.js');
const chalk = require('chalk');
const { parse } = require('csv-parse');
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


async function doThing() {
  await sleep(1500);

  const csvData = [];
  fs.createReadStream('./sources/arc/reptiles.csv') // need to run this for birds, mammals, domestic, amphibians, reptiles
    .pipe(parse({ delimiter: ',' }))
    .on('data', async function(csvrow) {
      // console.log(csvrow[0]);
      // do something with csvrow
      csvData.push(csvrow);
      const pattern = /(\w{4})/;
      if (pattern.test(csvrow[0])) {
        const usgs = await db.get({ 'id':csvrow[0] }, 'usgsspecies');
        if (usgs == null) {console.log(chalk.red(`no usgs entry for ${csvrow[0]}`));}
        const entry = {
          'id':csvrow[0],
          'name':csvrow[1],
          'sciname':csvrow[2],
          'bandsize':usgs?.bandsize,
          'category': {
            'basic':'reptile',
            'detail':csvrow[3],
          },
          'designation':csvrow[4],
          'bclist':csvrow[5],
        };
        db.insert(entry, 'id', 'species');
        // console.log(JSON.stringify(entry, '', 2));
      }

    })
    .on('end', function() {
      // do something with csvData
      // console.log(csvData);
      console.log(csvData.length);
    });
}

doThing();
