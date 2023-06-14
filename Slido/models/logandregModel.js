var pg = require('pg');
const crypto = require("crypto");
var {config} = require('./konekcijaNaBazu');

var pool = new pg.Pool(config);

const loginUser = function (username, password, cb) {
    pool.connect(async function (err, client, done) {
        if (err) {
            return cb(err);
        }
        await client.query(`select * from registrovani where email = $1 and obrisan = false`, [username],
            function (err, result) {
                //done();
                if (err) {
                    return cb(err);
                } else {
                    if (result.rows.length === 0) {
                        return cb(null, false, {message: 'Pogresan email ili sifra.'});
                    }
                    else{
                        client.query(`select * from registrovani where email = $1 and obrisan = false and banovando <= $2`, [username, new Date()],
                            function (err, result) {
                                done();
                                if (err) {
                                    return cb(err);
                                } else {
                                    if (result.rows.length === 0) {
                                        return cb(null, false, {message: 'Banovani ste od strane admina.'});
                                    }
                                }

                                crypto.pbkdf2(password, result.rows[0].salt, 310000, 32, 'sha256', function (err, hashedPassword) {
                                    if (err) {
                                        return cb(err);
                                    }
                                    if (!crypto.timingSafeEqual(hashedPassword, result.rows[0].sifra)) {
                                        return cb(null, false, {message: 'Pogrešan email ili šifra.'});
                                    }
                                    return cb(null, result.rows[0]);
                                });
                            });
                    }
                }
            });
        });
};

const registracija = (req, res, hashedPassword, salt) => {
    pool.connect(function (err, client, done) {
        if (err) {
            return next(err);
        }
        client.query(`select * from registrovani where email = $1 and obrisan = false`, [req.body.email],
            function (err, result) {
                //done();
                if (err) {
                    return res.send(err);
                } else {
                    if (result.rows.length > 0) {
                        req.flash('err', 'Email se već koristi.');
                        res.redirect('/registracija');
                    }
                    else{
                        pool.connect(function (err, client, done) {
                            if (err) {
                                return res.send(err);
                            }
                            client.query(`insert into registrovani (ime, prezime, email, sifra, salt) VALUES ($1, $2, $3, $4, $5)`
                                ,[req.body.ime, req.body.prezime, req.body.email, hashedPassword, salt],
                                function(err) {
                                    done();
                                    if (err) { return res.send(err); }
                                    res.redirect('/login');
                                });
                        });
                    }
                }
            });
    });
};


module.exports = {
    loginUser,
    registracija
};