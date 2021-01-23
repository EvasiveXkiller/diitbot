const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
var readline = require('readline');

const adapter = new FileSync("db.json");
const db = low(adapter);

// Set some defaults
db.defaults({ quotes: []}).write();

db.get('quotes').push({
    Name: "Hui Shan",
    Quotes: [
        "This is a test"
    ]
})

let string = "New Quote"

let edit = db.get('quotes').find({Name :"Hui Shan"}).value()

console.log(edit)
let newEntry = edit.Quotes.push(string)

console.log(edit)

console.log(updated)
db.update('quotes')
    .find({Name : "Hui Shan"})
    .assign({Quotes})



// Set a user using Lodash shorthand syntax
console.log(db.getState())
