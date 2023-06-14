var express = require('express');
var router = express.Router();
var controllers = require('../controllers/administratorController')

controllers.login();

controllers.serializeUser();

controllers.deserializeUser();


router.get('/login', controllers.alreadyLoggedIn, controllers.renderZaLogin)

router.post('/loginAdmin', controllers.loginAdmin);

router.post('/logout', controllers.logout);

router.put('/obrisi', controllers.obrisiPredavaca, controllers.ispisiPredavace, function(req, res, next){
  res.json({ id: req.body.id });
});

router.put('/obrisipredavanje', controllers.obrisiPredavanje, controllers.ispisiPredavanja, function(req, res, next){
  res.json({ id: req.body.id });
});

router.get('/', controllers.checkAuthenticated, controllers.ispisiPredavace, function(req, res, next) {
  res.render('admin/administrator', { title: 'Slido', predavaci: res.predavaci });
});

router.get('/predavanja', controllers.checkAuthenticated, controllers.ispisiPredavanja, function(req, res, next) {
  res.render('admin/predavanja', { title: 'Slido', predavanja: res.predavanja});
});

router.get('/pitanja', controllers.checkAuthenticated, controllers.ispisiPitanja, function(req, res, next) {
  res.render('admin/pitanja', { title: 'Slido', pitanja: res.pitanja});
});

router.put('/obrisipitanje', controllers.obrisiPitanje, controllers.ispisiPitanja, function(req, res, next){
  res.json({ id: req.body.id });
});

router.get('/zabranjenerijeci', controllers.checkAuthenticated, controllers.ispisiRuzneRijeci, function(req, res, next) {
  res.render('admin/zabranjenerijeci', { title: 'Slido', rijeci: res.rijeci});
});

router.put('/obrisirijec', controllers.obrisiRuznuRijec, controllers.ispisiPitanja, function(req, res, next){
  res.json({ id: req.body.id });
});

router.put('/dodajrijec', controllers.dodajRuznuRijec, function(req, res, next){
  res.json({ ajdirijeci: req.ajdirijeci });
});

router.put('/banuj', controllers.banuj, function(req, res, next){
  res.json({ id: req.body.id });
});


module.exports = router;
