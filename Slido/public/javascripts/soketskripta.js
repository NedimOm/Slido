function posaljiPoruku(kod){
    let tekst=document.getElementById("tekst_poruke").value;
    socket.emit('klijent_salje_poruku', kod, tekst);
    socket.emit('ispisi_poruku', kod, tekst);
}

socket.on('izbroj', function(broj){
    document.getElementById('trenutnibroj').innerHTML = `Trenutno aktivno: ${broj}`
});

socket.on('poruka_sa_servera', function(data, id_pitanja){
    if(data !== ''){
        $('#pitanja')
            .prepend($('<div class="alert alert-info bojapitanja" role="alert" id="pitanje"><li class="list-group-item"></li></div>').text(data)
                .append($('<button id="ajdi"></button>').addClass('lajk')
                    .text('').append($('<i id="ajdi3" style="font-size:20px;color:white" class="fa fa-solid fa-heart"></i>')))
                        .append($('<span id="ajdi2" style="float: right; margin-right: 5px;"></span>').text(0)));
        document.getElementById("pitanje").setAttribute("id",`pitanje${id_pitanja}`);
    document.getElementById("ajdi").setAttribute("id",`klik${id_pitanja}`);
    document.getElementById("ajdi2").setAttribute("id",`broj${id_pitanja}`);
    document.getElementById("ajdi3").setAttribute("id",`srce${id_pitanja}`);
    document.getElementById(`klik${id_pitanja}`).setAttribute("onclick", `povecaj(${id_pitanja})` );
    }
    document.getElementById("tekst_poruke").value = '';
});

socket.on('poruka_sa_servera_predavacu', function(data, id_pitanja){
    if(data !== '')
        $('#pitanja')
            .prepend($('<div class="alert alert-info bojapitanja" role="alert" id="pitanje"><li class="list-group-item"></li></div>').text(data)
                .append($('<button <i style="font-size:20px;color:white" class="fa fa-solid fa-heart"></i>/>').addClass('lajk').text(''))
                .append($('<span id=ajdi style="float: right; margin-right: 5px;"></span>').text(0)));
    document.getElementById("ajdi").setAttribute("id",`broj${id_pitanja}`);
    document.getElementById("pitanje").setAttribute("id",`pitanje${id_pitanja}`);
    $(`#pitanje${id_pitanja}`).prepend($('<div style="float: left;"> <button class="batoni" id="b1"><i style="color: darkred; font-size: 20px;" class="fa fa-times"></i></button> <button class="batoni" id="b2"><i style="font-size: 20px;" class="fa fa-eye"></i></button> <button class="batoni" id="b3"><i style="color: green; font-size: 20px;" class="fa fa-check"></i></button></div>'));
    $('#b1').attr('onclick', `obrisiPitanje(${id_pitanja})`);
    $('#b2').attr('onclick', `sakrijPitanje(${id_pitanja})`);
    $('#b3').attr('onclick', `odgovoriPitanje(${id_pitanja})`);

    $('#b1').attr('id', `obrisiPitanje(${id_pitanja})`);
    $('#b2').attr('id', `sakrijPitanje(${id_pitanja})`);
    $('#b3').attr('id', `odgovoriPitanje(${id_pitanja})`);
});

socket.on('sakrivenaporuka_sa_servera_predavacu', function(data){
    if(data !== '')
        $('#pitanja')
            .prepend($('<div class="alert alert-info bojapitanja" role="alert"><li class="list-group-item"></li></div>').text(data))
});

socket.on('ima_vec_poruka', function(id, broj)
{
    document.getElementById("postojipitanje").innerHTML = "To pitanje je vec bilo postavljeno.";
    document.getElementById("postojipitanje").style.color = "red";
});

socket.on('ocisti_ima_vec_poruka', function()
{
    document.getElementById("postojipitanje").innerHTML = "";
});

socket.on('promijeni_lajk', function(id, broj)
{
    $(`#broj${id}`).html(broj);
});

socket.on('ukloni', function (id){
   $(`#pitanje${id}`).remove();
});

var niz = localStorage.getItem('lajkanaPitanja') || [];

var input = document.getElementById("tekst_poruke");

if(input){
    input.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault();
            document.getElementById("dugmic").click();
        }
    });
}
