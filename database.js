const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

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

let string = "i want to watch "
// apa luuuuuu
let edit = db.get('quotes').find({Name :"Zhen Yick"}).value()

console.log(edit)
let newEntry = edit.Quotes.push(string)

console.log(edit)

db.get('quotes').find({ Name : "Zhen Yick" }).push(string)

console.log(db.get("quotes").map("Name").value())
console.log(db.get('quotes').find({ Name : "Carlson" }).value())
// Set a user using Lodash shorthand syntax
console.log(db.getState())
