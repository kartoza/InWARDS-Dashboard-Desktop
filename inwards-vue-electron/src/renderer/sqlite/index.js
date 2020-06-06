/* eslint-disable no-unused-vars */
import { remote } from 'electron';
import path from 'path';
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
let db;
export let dbFilePath = path.join(remote.app.getPath('userData'), '/inwards_template.sqlite3');
export let dbUrl = 'http://inwards.award.org.za/db/db_download.php';
export let dbReady = false;

function conn () {
  if (!db || !db.open) {
    isDbExist();
    db = new sqlite3.Database(
      dbFilePath, sqlite3.OPEN_READWRITE, (err) => {
        if (err) {
          return console.error(err.message);
        } else {
          dbReady = true;
          console.log('Connected to inward database.');
        }
      });
  }
  return db;
}

export const isDbExist = () => {
  if (!fs.existsSync(dbFilePath)) {
    return false;
  } else {
    return true;
  }
};

export const rawQuery = (query, callback) => {
  let db = conn();
  db.all(query, (err, rows) => {
    if (err) {
      console.error(err);
      callback(null, err);
    } else {
      callback(rows, null);
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
