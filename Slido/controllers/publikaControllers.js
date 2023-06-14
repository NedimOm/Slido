var io = null;
const db = require('../models/publikaModel');

module.exports = {
    provjeraDaLiPostojiPredavanje: (req, res, next) => {
        db.provjeraPredavanje(req, res, next);
    },

    ispisiPitanja: (req, res, next) => {
        db.ispisiPitanja(req, res, next);
    },

    sortiraj: (req, res, next) => {
        db.sortiraj(req, res, next);
    },

    soketi: (req, res, next) => {
        var lajkanaPitanja = [];
        if(!io) {
            io = require('socket.io')(req.connection.server);

            io.sockets.on('connection', function (client) {
                var currentRoomId;
                client.on('kreiraj', room => {
                    client.join(room);
                    currentRoomId = room;
                    var clientsList = io.sockets.adapter.rooms.get(room) || [];
                    var numClients = clientsList.size;
                    io.to(`predavac${room}`).emit('izbroj', numClients);
                });

                client.on('klijent_salje_poruku', async function (room, data) {
                    await db.provjeriPitanje(req, res, next, data, room, io, client.id);
                });

                client.on('ukloni_pitanje', function(id){
                    io.emit('ukloni', id);
                });

                client.on('lajkao',async function(id_pitanja, vec_lajkano, broj_lajkova, niz){
                    lajkanaPitanja = niz;
                    req.broj_lajkova = broj_lajkova;
                    await db.promijeniLajkove(req, res, next, id_pitanja, vec_lajkano, broj_lajkova);
                    if(vec_lajkano) broj_lajkova--;
                    else broj_lajkova++;
                    io.emit('promijeni_lajk', id_pitanja, broj_lajkova);
                });

                client.on('load', (room) => {
                    var clientsList = io.sockets.adapter.rooms.get(room) || [];
                    var numClients = clientsList.size;
                    if(numClients == null) numClients=0;
                    io.to(`predavac${room}`).emit('izbroj', numClients);
                });

                client.on('disconnect', () => {
                    var clientsList = io.sockets.adapter.rooms.get(currentRoomId) || [];
                    var numClients = clientsList.size;
                    if(numClients == null) numClients=0;
                    io.to(`predavac${currentRoomId}`).emit('izbroj', numClients);
                });

            });
        }
        if(req.user)
            res.render('predavac/predavacpitanja', {pitanja: req.pitanja, kod: req.params.kod, ipadresa: 'localhost', putanja: req.putanja});
        else {
            res.render('publika/publikapitanja', {pitanja: req.pitanja, kod: req.params.kod, lajkana: req.cookies.lajkana || [], ipadresa : 'localhost', putanja: req.putanja});}
    }
}