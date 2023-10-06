'use strict';

/** Data Access Object (DAO) module for accessing sitetitle data **/

const db = require('./db');

exports.getMainTitle = () => {
    const sql = "select title from sitetitle where id=1";
    return db.dbGetAsync(sql);
};

exports.updateMainTitle = (title) => {
    const sql = "update sitetitle set title=? where id=1";
    return db.dbRunAsync(sql, title);
}