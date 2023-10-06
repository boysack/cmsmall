'use strict';

/** DB access module **/

const sqlite = require("sqlite3");

const dbname = "data.db";
const db = new sqlite.Database(dbname, (err) => {
  if (err) throw err;
});

/**
 * Activate foreign keys constrains
 */
db.get("PRAGMA foreign_keys = ON");

/**
 * Wrapper around db.all
 */
exports.dbAllAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if (err) reject(err);
    else     resolve(rows);
  });
});

/**
 * Wrapper around db.run
 */
exports.dbRunAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if (err) reject(err)
    else     resolve(this.lastID);
  });
});

/**
 * Wrapper around db.get
 */
exports.dbGetAsync = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if (err) reject(err);
    else     resolve(row);
  });
});
