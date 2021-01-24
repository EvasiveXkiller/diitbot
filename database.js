const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

const adapter = new FileSync("db.json");
const db = low(adapter);

// Set some defaults
// db.defaults({ quotes: []}).write();

// db.get('quotes').push({
//     Name: "Hui Shan",
//     Quotes: [
//         "This is a test"
//     ]
// })
db.read()
let string = "i want to watch "
// apa luuuuuu
let edit = db.get('quotes').find({Name :"Hui Shan"}).value()

let old = [...edit.Quotes]

console.log(old)

old.push("Something")

console.log(old)

db.get("quotes")
    .find({ Name: "Hui Shan"})
    .assign({ Quotes : old})
    .write()


//console.log(db.get("quotes").map("Name").value()) // * find all root keys
//console.log(db.get('quotes').find({ Name : "Hui Shan" }).value())
