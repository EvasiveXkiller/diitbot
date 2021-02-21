const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");
const adapter = new FileSync("dbtest.json");
const db = low(adapter);


db.defaults({ posts: [], user: {}, count: 0 })
  .write()