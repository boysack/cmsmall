'use strict';

/** Data Access Object (DAO) module for accessing users data **/

const db = require('./db');
const crypto = require('crypto');

// Could be useful in front end for admin to decide which user
exports.listUsers = () => {
    const sql = "select id, name from users";
    return db.dbAllAsync(sql);
}

exports.getUserById = (id) => {
    const sql = "select id, username, name from users where id=?";
    return db.dbGetAsync(sql, [id]);
}

exports.getUserByUsername = (username) => {
    const sql = "select username, name from users where username=?";
    return db.dbGetAsync(sql, [username]);
}

exports.getUser = (username, password) => {
    const sql = "select id, username, name, admin, salt, hash from users where username = ?";
    return new Promise((resolve, reject) => {
        db.dbGetAsync(sql, [username])
            .then((row) => {
                if(!row)
                    resolve(false);
                else {
                    const user = {
                        id: row.id,
                        username: row.username,
                        name: row.name,
                        admin: parseInt(row.admin)===1
                    };
                    crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
                        if(err)
                            reject(err);
                        else if(!crypto.timingSafeEqual(Buffer.from(row.hash, "hex"), hashedPassword))
                            resolve(false);
                        else
                            resolve(user);
                    });
                }
            }).catch((err) => {
                reject(err);
            });
    });
};