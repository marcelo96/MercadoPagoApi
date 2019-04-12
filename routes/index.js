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
    "precio":15
  },
  "3":{
    "nombre":"goma",
    "precio":3
  },
  "4":{
    "nombre":"colores",
    "precio":10
  },
  "5":{
    "nombre":"hojas",
    "precio":2
  }
};

// Inicio
router.get('/', function(req, res, next) {
  res.render('inicio');
  // console.log('Datos json: ', datos);
});

//Crear una preferencia de pago
router.get('/pago/pagar/:id', (req, res) => {
  let id = req.params.id;
  let op = productos[id];
  // console.log('V: ' + id, 'Producto elegido: ' , op);

  var preference = {
    items: [
      {
        id: id,
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
      // console.log('Item de pago: ',p.body.items[0]);
      console.log('Información de la preferencia',p.body);
      
      // console.log('Informacion pasada a la vista', p.body.sandbox_init_point);
      res.render('index', {v:p.body.items[0].title,urlPago:p.body.sandbox_init_point});
    }).catch(function (error) {
      console.log(error);
    });
  }
});

// crear un pago
router.get('/otropago', (req, res) => {
  var payment = {
    description: 'Pagando PS4',
    transaction_amount: 15,
    payment_method_id: 'visa',
    payer: {
      email: 'test_user_3931694@testuser.com',
      identification: {
        type: 'DNI',
        number: '34123123'
      }
    }
  };
  
  mercadopago.payment.create(payment).then(function (mpResponse) {
    console.log(mpResponse);
  }).catch(function (mpError) {
    return mercadopago.payment.create(payment, {
      qs: {
        idempotency: mpError.idempotency
      }
    });
  }).then(function(mpResponse){
    console.log(mpResponse);
  });
});

//p1. 406264130-2ef0b72a-8969-43d8-be7b-1309e239af38
//p2. 406264130-223ae492-ec42-4601-a6c5-d285f42677ac'

// cliente_id : 5908568980084275
// cliente_id : 5908568980084275

// Cancelar pago
router.get('/pago/cancelar/:ide', (req, res) => {
  let ide = req.params.ide;
  // res.send(ide+'');
  console.log('id de pago: ', ide);
  
  if(ide){
    mercadopago.payment.update({
      id: ide,
      status: "cancelled"
    }).then(function(ok){
      res.sendStatus(200);
      console.log(ok);
      
    }).catch(function(err){
      res.sendStatus(500);
      console.log(err);
      
    });
  }
});

// Obtener pagos realizados
router.get('/obtenerpagos', (req, res) => {
  mercadopago.payment.search({
    qs: {
      'collector.id': 'me'
    }
  }).then(function (mpResponse) {
    console.log(mpResponse.body.results[0]);
    res.status(200).json(mpResponse.body.results);
  }).catch(function(err){
    res.sendStatus(500);
  });
});

// Notificaciones
router.get('/notificaciones', (req, res) => {
  res.sendStatus(200);
});

module.exports = router;
