var express = require('express');
var router = express.Router();
const mercadopago = require('mercadopago');
const engines = require('consolidate');

//const datos = require('../datos.json');

// Configuraciones de MercadoPago
mercadopago.configure({
  sandbox: true,
  access_token: 'TEST-5908568980084275-030619-a73d504c7eb53a8993f71fecdd6efad9-406264130'
});

// Ejemplo de productos
let productos = {
  "1":{
    "nombre":"lapiz",
    "precio":5
  },
  "2":{
    "nombre":"libreta",
    "precio":6
  },
  "3":{
    "nombre":"goma",
    "precio":7
  }
};

// Inicio
router.get('/', function(req, res, next) {
  res.render('inicio');
  // console.log('Datos json: ', datos);
});

//Crear una preferencia de pago
router.get('/pagar/:i', (req, res) => {
  let i = req.params.i;
  let op = productos[i];
  console.log('V: ' + i, 'Producto elegido: ' , op);

  var preference = {
    items: [
      {
        id: i,
        title: op.nombre,
        quantity: 1,
        currency_id: 'MXN',
        unit_price: op.precio
      }
    ],
    payer: {
      email: 'lillian.beer@hotmail.com'
    }
  };

  if(op){
    mercadopago.preferences.create(preference).then(function (preference) {
      const p = preference;
      console.log('Item de pago: ',p.body.items[0]);
      // console.log('Informacion pasada a la vista', p.body.sandbox_init_point);
      res.render('index', {v:p.body.items[0].title,urlPago:p.body.sandbox_init_point});
    }).catch(function (error) {
      console.log(error);
      return mercadopago.preferences.create(preference, {
        qs: {
          idempotency: mpError.idempotency
        }
      });
    });
  }
});

// Obtener pagos realizados
router.get('/obtenerpagos', (req, res) => {
  var configurations = {
    qs: {
      'payer.id': 'me'
    }
  };
  
  mercadopago.payment.search(configurations, function(error, respuesta){
    if(error){
      console.log(error);
      res.sendStatus(500);
    }
    console.log(respuesta);
    res.sendStatus(200);
  });
});

module.exports = router;
