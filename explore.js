const db = require('./database.js');
const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));


async function doThing() {
  await sleep(1500);


}

doThing();

(async () => {
  await sleep(2000);
  const prompt = require('prompt-sync')({ sigint: true });
  let exit = false;
  while (!exit) {
    const input = prompt('get, clear, quit: ');
    if (input == 'get') {
      const search = prompt('search for: ');
      const result = await db.get({ 'id':search }, 'species');
      console.log(JSON.stringify(result, '', 2) || 'no result');
    } else if (input == 'clear') {
      console.clear();
    } else if (input == 'quit') {
      db.closeDB();
      exit = true;
    } else {
      console.log('\ninvalid input');
    }
  }
})();