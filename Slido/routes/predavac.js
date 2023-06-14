var express = require('express');
var router = express.Router();
var controllers = require('../controllers/predavacControllers');
const pubcontrollers = require("../controllers/publikaControllers");
const nodemailer = require("nodemailer");


router.get('/pitanja/:kod', controllers.checkAuthenticated, controllers.ispisiPitanja, pubcontrollers.soketi);

router.post('/kreiranje', controllers.kreiranjePredavanja);

router.get('/predavanja', controllers.checkAuthenticated, controllers.mojaPredavanja);

router.get('/', controllers.checkAuthenticated, controllers.renderZaPocetak);

router.post('/posaljipublici', function (req, res, next) {
    niz = req.body.emailovi.split(" ");
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: 'slidoBiH@outlook.com',
            pass: 'JedanDvaTri123'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    const mailOptions = {
        from: 'slidoBiH@outlook.com',
        to: niz.join(','),
        subject: 'Link za pristup predavanju!',
        text: `Link za pristup predavanju je: localhost:3000/pitanja/${req.body.kodPredavanja}`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });

    res.redirect(`/predavac/pitanja/${req.body.kodPredavanja}`);
});

router.put('/obrisiPitanje', controllers.obrisiPitanje, function(req, res, next){
    res.json({ id: req.body.id });
});

router.put('/sakrijPitanje', controllers.sakrijPitanje, function(req, res, next){
    res.json({ id: req.body.id });
});

router.put('/odgovoriPitanje', controllers.odgovoriPitanje, function(req, res, next){
    res.json({ id: req.body.id });
});

router.get('/sakrivenaPitanja/:kod', controllers. checkAuthenticated, controllers.ispisiSakrivenaPitanja, function (req, res, next){
    res.render('predavac/predavacSakrivenaPitanja', {kod : req.params.kod, pitanja: req.sakrivenapitanja});
});

router.put('/sortiraj', controllers.sortiraj, function(req, res, next){
    res.json({ pitanja: req.pitanja });
});

router.put('/izvjestaj', controllers.izvjestaj, controllers.izvjestaj2, function(req, res, next){
    const transporter = nodemailer.createTransport({
        service: 'outlook',
        auth: {
            user: 'slidoBiH@outlook.com',
            pass: 'JedanDvaTri123'
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    var tekst = '';
    tekst += `Na Vasem predavanju bilo je ${res.zapredavanje[0].brojp} pitanja, a odgovoreno je na ${res.zapredavanje[0].brojo} pitanja.`;
    tekst += '\n';
    tekst += '\n';
    tekst += 'Pitanja na predavanju su bila: ';
    tekst += '\n';
    tekst += '\n';

    for(let i=0;i<res.zaprpitanja.length;i++){
        tekst+=res.zaprpitanja[i].tekst;
        tekst+= " -  ";
        tekst+=res.zaprpitanja[i].broj_lajkova.toString();
        tekst+=" odobravanja";
        tekst += '\n';
    }

    console.log(req.user.email);

    const mailOptions = {
        from: 'slidoBiH@outlook.com',
        to: req.user.email,
        subject: `Statistika za Vase predavanje pod nazivom "${res.zapredavanje[0].naziv}"!`,
        text: tekst
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
    res.json({});
});


module.exports = router;
