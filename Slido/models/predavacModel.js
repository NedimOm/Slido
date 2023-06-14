var pg = require('pg');
var rn = require('random-number');
var {config} = require('./konekcijaNaBazu');
var options = {
    min:  1111111,
    integer: true,
    max: 9999999
};
var kod;

var pool = new pg.Pool(config);

const izvjestaj = async (req, res, next) => {
    await pool.connect(async function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        await client.query(`select p.naziv, p.kod, p.datum, p.datumdo, p.putanja, count(pit.id) as brojp,
       (select count(*) from predavanja p1
    inner join pitanja pit1 on cast(pit1.kod_predavanja AS int) = cast(p1.kod as int)
        where pit1.odgovoreno = true and p1.obrisan = false and cast(p1.kod as int) = cast(p.kod as int)
            group by pit1.kod_predavanja) as brojo from predavanja p
    inner join pitanja pit on cast(pit.kod_predavanja AS int) = cast(p.kod AS int)
    where p.obrisan = false and cast(p.kod as int) = $1
    group by p.naziv, p.kod, p.datum, p.datumdo, p.putanja;`,[req.body.kod],
            function (err, result) {
                //done();
                if (err) {
                    return res.send(err);
                } else {
                    res.zapredavanje = result.rows;
                    next();
                }
            });
    });
};

const izvjestaj2 = async (req, res, next) => {
    await pool.connect(async function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        await client.query(`select tekst, broj_lajkova from pitanja where kod_predavanja = $1` , [req.body.kod],
            function(err, result){
                done();
                if (err) {
                    return res.send(err);
                } else {
                    res.zaprpitanja = result.rows;
                    next();
                }
            });
    });
};


const odgovoriPitanje = (req, res, next) => {
    var id = req.body.id;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE pitanja set odgovoreno = true WHERE id=$1`, [id],
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

const sakrijPitanje = (req, res, next) => {
    var id = req.body.id;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`UPDATE pitanja set sakriveno = true WHERE id=$1`, [id],
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


const kreiranjePredavanja = (req, res) => {
    if(!req.file) var putanja = null;
    else  putanja = req.file.path;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from predavanja`,[],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    let ima = false;
                    while(true) {
                        kod = rn(options);
                        for (let i = 0; i < result.rows.length; i++) {
                            if (kod == result.rows[i].kod) ima = true;
                        }
                        if(!ima || result.rows.length == 0) break;
                    }
                }
            });
    });

    pool.connect(function (err, client, done) {
        if (err) {
            return next(err);
        }
        client.query(`insert into predavanja (naziv, kod, datum, "idPredavaca", putanja, datumdo) VALUES ($1, $2, $3, $4, $5, $6)`
            ,[req.body.naziv, kod, req.body.datum, req.user.id, putanja, req.body.datumdo],
            function(err) {
                done();
                if (err) { return res.send(err); }
                req.flash('ok', 'Uspješno ste kreirali predavanje!');
                res.redirect("/predavac");
            });
    });
};

const mojaPredavanja = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select p.naziv, p.kod, p.datum, p.datumdo, p.putanja, count(pit.id) as brojp,
       (select count(*) from predavanja p1 inner join pitanja pit1 on cast(pit1.kod_predavanja AS int) = cast(p1.kod as int) 
       where pit1.odgovoreno = true and p1.obrisan = false and cast(p1.kod as int) = cast(p.kod as int)
            group by pit1.kod_predavanja) as brojo from predavanja p
            left join pitanja pit on cast(pit.kod_predavanja AS int) = cast(p.kod AS int)
            where p.obrisan = false and p."idPredavaca" = $1 and p.datumdo >= $2
            group by p.naziv, p.kod, p.datum, p.datumdo, p.putanja 
            order by p.datum desc, p.datumdo asc;`,[req.user.id, new Date()],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    res.predavanja = result.rows;
                    res.render('predavac/predavanja', { title: 'Slido', predavanja: res.predavanja });
                }
            });
    });
};

const ispisiPitanja = (req, res, next) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from pitanja where kod_predavanja = $1 and obrisan = false and sakriveno = false and odgovoreno = false order by vrijeme asc`,[req.params.kod],
            function (err, result) {
                //done();
                if (err) {
                    return res.send(err);
                } else {
                    req.pitanja = result.rows;
                }
            });
        client.query(`select putanja from predavanja where kod = $1`,[req.params.kod],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    req.putanja = result.rows[0].putanja;
                    next();
                }
            });
    });

};

const ispisiSakrivenaPitanja = async (req, res, next) => {
    await pool.connect(async function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        await client.query(`select * from pitanja where kod_predavanja = $1 and sakriveno = true order by vrijeme asc`,[req.params.kod],
            function (err, result) {
                done();
                if (err) {
                    return res.send(err);
                } else {
                    req.sakrivenapitanja = result.rows;
                    next();
                }
            });
    });
};

const sortiraj = async (req, res, next) => {
    kod = parseInt(req.body.kod);
    if(req.body.kljuc == 'vrijeme') {
        await pool.connect(async function (err, client, done) {
            if (err) {
                return res.send(err);
            }
            await client.query(`select * from pitanja where kod_predavanja = $1 and obrisan = false and sakriveno = false and odgovoreno = false order by vrijeme asc`, [kod],
                function (err, result) {
                    done();
                    if (err) {
                        return res.send(err);
                    } else {
                        req.pitanja = result.rows;
                        next();
                    }
                });
        });
    }
    else{
        await pool.connect(async function (err, client, done) {
            if (err) {
                return res.send(err);
            }
            await client.query(`select * from pitanja where kod_predavanja = $1 and obrisan = false and sakriveno = false and odgovoreno = false order by broj_lajkova asc`, [kod],
                function (err, result) {
                    done();
                    if (err) {
                        return res.send(err);
                    } else {
                        req.pitanja = result.rows;
                        next();
                    }
                });
        });
    }
};


module.exports = {
    kreiranjePredavanja,
    ispisiPitanja,
    mojaPredavanja,
    obrisiPitanje,
    sakrijPitanje,
    odgovoriPitanje,
    ispisiSakrivenaPitanja,
    sortiraj,
    izvjestaj,
    izvjestaj2
}