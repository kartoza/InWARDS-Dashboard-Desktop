const sqlite3 = require('sqlite3').verbose();
const path = require('path');
let db;

function conn () {
  if (!db || !db.open) {
    db = new sqlite3.Database(
      path.join(__dirname, '../assets', '/inwards_template.sqlite3'), sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          return console.error(err.message);
        } else {
          console.log('Connected to inward database.');
        }
      });
  }
  return db;
}

export const rawQuery = (query, callback) => {
  let db = conn();
  db.each(query, (err, row) => {
    if (err) {
      console.error(err);
    } else {
      callback(row);
    }
  });
};

export const insert = (table, valuesDict) => {
  let db = conn();
  let fields = [];
  let values = [];
  let params = [];
  for (let key in valuesDict) {
    fields.push(key);
    values.push(valuesDict[key]);
    params.push('?');
  }
  db.run(`INSERT INTO ${table} (${fields.join(',')}) VALUES (${params.join(',')})`, values, (err) => {
    if (err) {
      return console.error(err.message);
    }
    console.log(`Row was added to table`);
  });
};
