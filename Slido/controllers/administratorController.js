const db = require('../models/administratorModel');
const passport = require("passport");
const LocalStrategy = require("passport-local");

module.exports = {
    renderZaLogin: (req, res, next) => {
        res.render('admin/adminlogin');
    },

    ispisiPitanja : db.dajPitanja,

    ispisiPredavanja : db.dajPredavanja,

    ispisiPredavace : db.dajPredavace,

    ispisiRuzneRijeci : db.ispisiRuzneRijeci,

    obrisiRuznuRijec : db.obrisiRuznuRijec,

    dodajRuznuRijec : db.dodajRuznuRijec,

    obrisiPredavaca : db.obrisiPredavaca,

    obrisiPredavanje : db.obrisiPredavanje,

    obrisiPitanje : db.obrisiPitanje,

    banuj : db.banuj,

    loginAdmin :  passport.authenticate('nekiDrugiNazivNeLocal', {
    successReturnToOrRedirect: '/administrator',
    failureRedirect: '/administrator/login',
    failureFlash: true
    }),

    logout: (req, res, next) => {
        req.logout(function(err) {
            if (err) { return next(err); }
            res.redirect('/administrator/login');
        });
    },

    login: (req, res, next) => {
        passport.use('nekiDrugiNazivNeLocal', new LocalStrategy(function verify(username, password, cb) {
            db.loginAdmin(username, password, cb);
        }));
    },

    checkAuthenticated: function (req,res,next){
        if(req.isAuthenticated() && req.user.uloga == false){
            res.redirect('/predavac');
        }
        else if(req.isAuthenticated())
            return next();
        res.redirect('/login');
    },

    alreadyLoggedIn: (req, res, next) => {
        if(req.isAuthenticated() && req.user.uloga == false){
            res.redirect('/predavac');
        }
        else if(req.isAuthenticated()) res.redirect('/administrator');
        next();
    },

    serializeUser: () => {
        passport.serializeUser(function(user, cb) {
            process.nextTick(function() {
                cb(null, { id: user.id, email: user.email, ime: user.ime });
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
