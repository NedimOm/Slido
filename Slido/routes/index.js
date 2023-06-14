var express = require('express');
var router = express.Router();
const controllers = require('../controllers/logandregControllers');
const pubcontrollers = require('../controllers/publikaControllers');

controllers.loginUser();

controllers.serializeUser();

controllers.deserializeUser();


router.post('/pitanja', function(req, res, next) {
    res.redirect(`/pitanja/${req.body.kod}`)
});

router.get('/pitanja/:kod', pubcontrollers.provjeraDaLiPostojiPredavanje, pubcontrollers.ispisiPitanja, pubcontrollers.soketi);

router.put('/sortiraj', pubcontrollers.sortiraj, function(req, res, next){
    res.json({ pitanja: req.pitanja });
});

router.get('/login', controllers.alreadyLoggedIn, controllers.zaLoginPocetniRender);

router.post('/loginUser', controllers.alreadyLoggedIn, controllers.autentifikacija);

router.post('/logout', controllers.logout);

router.get('/registracija', controllers.alreadyLoggedIn, controllers.zaRegistracijuPocetniRender);

router.post('/registracija', controllers.alreadyLoggedIn, controllers.registracija);

router.get('/', controllers.alreadyLoggedIn, controllers.zaPocetniRender);

module.exports = router;
