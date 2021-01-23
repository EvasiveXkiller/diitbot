const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
var readline = require('readline');


const adapter = new FileSync("db.json");
const db = low(adapter);

// Set some defaults
db.defaults({ quotes: []}).write();




// Set a user using Lodash shorthand syntax



console.log(db.getState());
