var express = require('express');
var router = express.Router();
var request = require('request') // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');

var playlist_url;
var temperatura;
var humedad;
var redirect_uri = 'http://localhost:8888/callback'; // Your redirect uri
var playlist_url;
var app = express();
var client_id = '9d4ea19266674cd29163aac644f488b8'; // Your client id
var client_secret = 'e056de3e63ed44f39e15d8b6b37ec748';
var options;
var token;
var authOptions;
var estadoClima;
var rolas=[];
var urlrolas=[];
var listaderepro=[];


/* GET home page. */
router.get('/', function(req, res, next) {
      var datos={
             titulo:'Articulos disponibles a la fecha',
             articulos: [
               { codigo: 1,precio:12,descripcion: 'peras' },
               { codigo: 2,precio:132,descripcion: 'manzanas' },
               { codigo: 3,precio:23,descripcion: 'naranjas' },
             ],
             descuento:{lunes:'5%',martes:'10%'},
             clima: {temperatura: temperatura.toFixed(1), humedad: humedad},
             rolas
          }
       res.render('index', datos);
});

function AutorizacionUsuario() {
    authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
        },
        form: {
            grant_type: 'client_credentials'
        },
        json: true
    };
}


function DatosClimatologicos() {
    request.get('http://api.openweathermap.org/data/2.5/weather?id=3515001&APPID=23445674ac18fd22f990727f67bb2c6f',{ json:true },(err, res, body)=>{
        if(err){}
        temperatura=body.main.temp;
        humedad= body.main.humidity;
        temperatura=temperatura-273.15;
        if(temperatura>26 && humedad<40){
            estadoClima="Soleado";
        }
        if(temperatura<30 && humedad>40){
            estadoClima="Nublado";
        }
        if (temperatura<30 && humedad>70) {
            estadoClima="Lluvioso";
        }
        if (temperatura<15 && humedad<60) {
            estadoClima="Nevado";
        }
    });
}

function AccesoPlaylist() {
    request.post(authOptions, function(error, response, body) {
        if (!error && response.statusCode === 200) {
            // Solicitud acceso a playlist de usuario
            token = body.access_token;
            options = {
                url: 'https://api.spotify.com/v1/users/vprqlu4kvyu9fa4mnaev9ag2o/playlists',
                headers: {
                    'Authorization': 'Bearer ' + token
                },
                json: true
            };
        }
    });
}


function Playlist() {
    request.get(options, function(error, response, body) {
        if (response){
            for (let i = 0; i < body.items.length; i++) {
                if(body.items[i].name==estadoClima){
                    playlist_url = body.items[i].href;
                    listaderepro =  body.items[i].external_urls.spotify;
                }

                //console.log(body.items[i].name);
                var option = {
                    url: playlist_url,
                    headers: {
                        'Authorization': 'Bearer ' + token
                    },
                    json: true
                };
                request.get(option, function(error, response, body) {
                    if (response) {
                        for (let x = 0; x < body.tracks.items.length; x++) {
                            rolas.push({nombre: body.tracks.items[x].track.name, url: body.tracks.items[x].track.external_urls.spotify});

                            urlrolas.push(body.tracks.items[x].track.external_urls.spotify);
                            //console.log(body.tracks.items[x].track.external_urls.spotify);
                        }
                    }else{
                        console.log("No encontrado")
                    }
                });
                //console.log(body.items[i]);
            }
        }
    });
}




DatosClimatologicos();
AutorizacionUsuario();
//setTimeout(EstadoClimatologico(),2000);
setTimeout(AccesoPlaylist,2000);
setTimeout(Playlist,3000);
setTimeout(datos,4000);
function datos() {
    console.log(temperatura);
    console.log(humedad);
    console.log(estadoClima);
    console.log(playlist_url);
}


module.exports = router;
