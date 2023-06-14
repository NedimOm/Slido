var pg = require('pg');
var {config} = require('./konekcijaNaBazu');
const crypto = require("crypto");


var pool = new pg.Pool(config);

const dajPredavace = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from registrovani where uloga = false and obrisan = false and banovando <= $1 order by prezime`,[new Date()],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    res.predavaci = result.rows;
                    next();
                }
            });
    });
};

const dajPredavanja = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from predavanja where obrisan = false and datum >= $1 order by datum desc`,[new Date()],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    res.predavanja = result.rows;
                    next();
                }
            });
    });
};

const obrisiPredavaca = (req, res, next) => {
    var id = req.body.id;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE registrovani set obrisan = $2 WHERE id=$1`, [id, true],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                }
            });
    });
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE predavanja set obrisan = true WHERE "idPredavaca" =$1`, [id],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
    });
};

const obrisiPredavanje = (req, res, next) => {
    var id = req.body.id;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE predavanja set obrisan = true WHERE id=$1`, [id],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
    });
};

const loginAdmin = (username, password, cb) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return cb(err);
        }
        client.query(`select * from registrovani where email = $1`, [username],
            function (err, result) {
                done();
                if (err) {
                    return cb(err);
                } else {
                    if (result.rows.length === 0) {
                        return cb(null, false, {message: 'Pogrešan email ili šifra.'});
                    }
                }

                crypto.pbkdf2(password, result.rows[0].salt, 310000, 32, 'sha256', function(err, hashedPassword) {
                    if (err) { return cb(err); }
                    if (!crypto.timingSafeEqual(hashedPassword, result.rows[0].sifra)) {
                        return cb(null, false, { message: 'Pogrešan email ili šifra.' });
                    }
                    return cb(null, result.rows[0]);
                });
            });
    });
};

const dajPitanja = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from pitanja where obrisan = false group by kod_predavanja, id order by vrijeme desc;`,
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    res.pitanja = result.rows;
                    next();
                }
            });
    });
};

const obrisiPitanje = (req, res, next) => {
    var id = req.body.id;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE pitanja set obrisan = true WHERE id=$1`, [id],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
    });
};

const obrisiRuznuRijec = (req, res, next) => {
    var id = req.body.idrijeci;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE "zabranjeneRijeci" set obrisana = true WHERE id=$1`, [id],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
    });
};

const ispisiRuzneRijeci = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from "zabranjeneRijeci" where obrisana = false;`,
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    res.rijeci = result.rows;
                    next();
                }
            });
    });
};

const dodajRuznuRijec = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`insert into "zabranjeneRijeci" (tekst) VALUES ($1) returning id`
            ,[req.body.rijec],
            function(err, result) {
                done();
                if (err) { return res.send(err); }
                req.ajdirijeci = result.rows[0].id;
                next();
            });
    });
};

const banuj = (req, res, next) => {
    var dani = req.body.dani;
    var id = req.body.id;
    var datum = new Date();
    var newDate;
    if(dani === 15)
        newDate = new Date(datum.setDate(datum.getDate() + 15));
    else
        newDate = new Date(datum.setDate(datum.getDate() + 30));
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE registrovani set banovando = $2 WHERE id=$1`, [id, newDate],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    next();
                }
            });
    });
};


module.exports = {
    dajPredavace,
    obrisiPredavaca,
    loginAdmin,
    dajPredavanja,
    obrisiPredavanje,
    dajPitanja,
    obrisiPitanje,
    obrisiRuznuRijec,
    ispisiRuzneRijeci,
    dodajRuznuRijec,
    banuj

};