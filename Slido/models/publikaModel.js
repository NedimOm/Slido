var pg = require('pg');
var {config} = require('./konekcijaNaBazu');
var stringSimilarity = require("string-similarity");

var pool = new pg.Pool(config);


const provjeriPitanje = (req, res, next, data, room, io, clientid) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from pitanja where kod_predavanja = $1 and obrisan = false and odgovoreno = false`, [room],
            function (err, result) {
                done();
                if (err) {
                } else {
                    if(result.rows){
                        let proslo = false;
                        for(let i=0;i<result.rows.length;i++){
                            console.log("jel ovo nece");
                            var similarity = stringSimilarity.compareTwoStrings(data, result.rows[i].tekst);
                                if(similarity > 0.6) {
                                    io.to(clientid).emit("ima_vec_poruka");
                                    proslo = true;
                                }
                        }
                        if (proslo === false && data !== '') {
                            postaviPitanje(req, res, next, data, room, io);
                            io.to(room).emit("ocisti_ima_vec_poruka");
                        }
                    }
                }
            });
    });
};

const provjeraPredavanje = async (req, res, next) => {
    await pool.connect(async function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        await client.query(`select * from predavanja where kod = $1 and obrisan = false and datumdo >= $2`, [req.params.kod, new Date()],
            function (err, result) {
                done();
                if (err) {
                } else {
                    if(result.rows.length > 0 ) {
                        next();
                    }
                    else{
                        req.flash('err', 'Predavanje sa unesenim kodom ne postoji!');
                        res.redirect('/');
                    }
                }
            });
    });
};


const postaviPitanje = (req, res, next, data, room, io) => {
    var ruzneRijeci = [];
    var ruznaRijec = false;
     pool.connect(async function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        await client.query(`select * from "zabranjeneRijeci"`,
            function (err, result) {
                done();
                if (err) {
                } else {
                    ruzneRijeci = result.rows;
                }
            });
    });

    pool.connect(function (err, client, done) {
        if (err) {
            return next(err);
        }
        client.query(`insert into pitanja (tekst, vrijeme, kod_predavanja) VALUES ($1, $2, $3) returning id`
            ,[data, new Date(), room],
            function(err, result) {
                let poruka = data.split(" ");
                for(let i=0;i<poruka.length;i++){
                    for(let j=0;j<ruzneRijeci.length;j++){
                        if(ruzneRijeci[j].tekst == poruka[i]) {
                            ruznaRijec = true;
                            break;
                        }
                        if(ruznaRijec) break;
                    }
                }
                if(ruznaRijec){
                    client.query(`update pitanja set sakriveno = true where id = $1`,[result.rows[0].id],
                        function (err, result) {
                            done();
                            if (err) {
                                return res.send(err);
                            }
                    });
                    io.to(`sakrivena${room}`).emit('sakrivenaporuka_sa_servera_predavacu', data);
                    io.to(room).emit('poruka_sa_servera', "", result.rows[0].id);
                }
                else
                {
                    io.to(`predavac${room}`).emit('poruka_sa_servera_predavacu', data, result.rows[0].id);
                    io.to(room).emit('poruka_sa_servera', data, result.rows[0].id);
                }
                if (err) { return res.send(err); }
            });
    });
};

const ispisiPitanja = (req, res, next) => {
    kod=req.params.kod;
    pool.connect(function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        client.query(`select * from pitanja where kod_predavanja = $1 and obrisan = false and sakriveno = false and odgovoreno = false order by vrijeme asc`,[kod],
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

}

const promijeniLajkove = async (req, res, next, id, lajkano, broj_lajkova) => {
    var broj=broj_lajkova;
    await pool.connect(async function (err, client, done) {
        if (err) {
            return res.send(err);
        }
        if(lajkano) {
            broj--;
            await client.query(`update pitanja set broj_lajkova = $1 where id = $2`, [broj, id],
                function (err, result) {
                    done();
                    if (err) {
                        return res.send(err);
                    }
                });
        }
        else{
            broj++;
            await client.query(`update pitanja set broj_lajkova = $1 where id = $2`,[broj, id],
                function (err, result) {
                    done();
                    if (err) {
                        return res.send(err);
                    }
                });
        }
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
    postaviPitanje,
    ispisiPitanja,
    provjeraPredavanje,
    promijeniLajkove,
    sortiraj,
    provjeriPitanje
}