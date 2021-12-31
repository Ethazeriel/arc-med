const convert = require('html-table-to-json');
const fs = require('fs');
const db = require('../database.js');
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


async function doThing() {
  await sleep(1500);
  let data;
  try {
    data = fs.readFileSync('./sources/usgs.html', 'utf8');
  } catch (err) {
    console.error(err);
  }
  const result = convert.parse(data);

  console.log(result.results[0][0]);

  result.results[0].forEach(async element => {
    const bird = {
      'id':element.code,
      'name':element.name,
      'sciname':element.sciname,
      'bandsize':element.band,
      'category':{ 'basic':'bird' },
    };
    await db.insert(bird, 'id', 'usgsspecies');
  });

  console.log('finished');
}

doThing();