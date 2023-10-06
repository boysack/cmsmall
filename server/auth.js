'use strict';

/** Authentication init module **/

const passport = require("passport");
const usersDao = require("./dao-users");
const session = require("express-session");
const LocalStrategy = require("passport-local");

/**
 * Helper function to initialize passport authentication with the LocalStrategy
 */
const initAuthentication = (app) => {
    passport.use(new LocalStrategy(async function verify(username, password, callback) {
        const user = await usersDao.getUser(username, password);
        if(!user)
            return callback (null, false, 'Incorrect username and/or password');
        return callback(null, user);
    })); 
    passport.serializeUser(function(user, callback) {
        callback(null, user);
    });
    passport.deserializeUser(function(user,callback) {
        return callback(null, user);
    });
      // Initialize express-session
    app.use(session({
        secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191",
        resave: false,
        saveUninitialized: false
    }));
    // Initialize passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
};

/**
 * Implementata nella soluzione dell'esempio d'esame
 */
/* function initAuthentication(app, db) {
  // Setup passport
  passport.use(new LocalStrategy((email, password, done) => {
    db.authUser(email.toLowerCase(), password)
      .then(student => {
        if (student) done(null, student);
        else         done({status: 401, msg: "Incorrect username and/or password"}, false);
      })
      //db error
      .catch(() => done({status: 500, msg: "Database error"}, false));
  }));

  // Serialization and deserialization of the student to and from a cookie
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    db.getStudent(id)
      .then(user => done(null, user))
      .catch(e => done(e, null));
  });

  // Initialize express-session
  app.use(session({
    secret: "586e60fdeb6f34186ae165a0cea7ee1dfa4105354e8c74610671de0ef9662191",
    resave: false,
    saveUninitialized: false
  }));

  // Initialize passport middleware
  app.use(passport.initialize());
  app.use(passport.session());
} */

/**
 * Express middleware to check if the user is authenticated.
 * Responds with a 401 Unauthorized in case they're not.
 */
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  return res.status(401).json({ errors: ["Not authenticated"] });
};

module.exports = { initAuthentication, isLoggedIn };