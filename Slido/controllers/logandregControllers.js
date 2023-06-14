const db = require("../models/logandregModel");
var passport = require('passport');
var LocalStrategy = require('passport-local');
const crypto = require("crypto");

module.exports = {
    zaLoginPocetniRender: (req, res, next) => {
        res.render('logandreg/login');
    },

    alreadyLoggedIn: (req, res, next) => {
        if(req.isAuthenticated() && req.user.uloga === false){
            res.redirect('/predavac');
        }
        else if(req.isAuthenticated()) res.redirect('/administrator');
        next();
    },

    autentifikacija:
        passport.authenticate('local', {
            successReturnToOrRedirect: '/predavac',
            failureRedirect: '/login',
            failureFlash: true
        })
    ,

    logout: (req, res, next) => {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/login');
        });
    },

    zaRegistracijuPocetniRender: (req, res, next) => {
        res.render('logandreg/registracija');
    },

    registracija: (req, res, next) => {
        var salt = crypto.randomBytes(16);
        crypto.pbkdf2(req.body.sifra, salt, 310000, 32, 'sha256', function(err, hashedPassword) {
            if (err) { return next(err); }
            db.registracija(req,res, hashedPassword, salt);
        });
    },

    zaPocetniRender: (req, res, next) => {
        res.render('index', {title: 'Slido'});
    },

    loginUser: (req, res, next) => {
        passport.use( new LocalStrategy(function verify(username, password, cb) {
            db.loginUser(username, password, cb);
        }));
    },

    serializeUser: () => {
        passport.serializeUser(function(user, cb) {
            process.nextTick( function() {
                cb(null, { id: user.id, email: user.email, ime: user.ime, uloga: user.uloga });
            });
        });
    },

    deserializeUser: () => {
        passport.deserializeUser(function(user, cb) {
            process.nextTick(function() {
                return cb(null, user);
            });
        });
    }
}