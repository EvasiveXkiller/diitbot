const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapterken = new FileSync("dbken.json");
const dbken = low(adapterken);


dbken.defaults({ gifs : []}).write()


console.log(dbken.get("gifs").value())