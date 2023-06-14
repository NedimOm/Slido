const db = require("../models/predavacModel");

module.exports = {
    obrisiPitanje: (req, res, next) => {
        db.obrisiPitanje(req, res, next);
    },

    sakrijPitanje: (req, res, next) => {
      db.sakrijPitanje(req, res, next);
    },

    ispisiPitanja: (req, res, next) => {
        db.ispisiPitanja(req, res, next);
    },

    ispisiSakrivenaPitanja: (req, res, next) => {
        db.ispisiSakrivenaPitanja(req, res, next);
    },

    odgovoriPitanje: (req, res, next) => {
        db.odgovoriPitanje(req, res, next);
    },

    sortiraj: (req, res, next) => {
        db.sortiraj(req, res, next);
    },

    checkAuthenticated: function (req,res,next){
        if(req.isAuthenticated() && req.user.uloga == false){
            return next();
        }
        else if(req.isAuthenticated())
            res.redirect('/administrator');
        res.redirect('/login');
    },

    renderZaPocetak: function(req, res, next){
        res.render('predavac/predavacpocetna', {ime: req.user.ime});
    },

    kreiranjePredavanja: function (req, res, next){
        db.kreiranjePredavanja(req, res);
    },

    mojaPredavanja: function (req, res, next){
        db.mojaPredavanja(req, res);
    },

    izvjestaj: function (req, res, next){
        db.izvjestaj(req, res, next);
    },

    izvjestaj2: function(req, res, next){
        db.izvjestaj2(req, res, next);
    }

};