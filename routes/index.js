var express = require('express');
var router = express.Router();
var geocoder = require('geocoder');
var redis = require("redis"),
  client = redis.createClient(process.env.REDIS_URL);
var lineReader = require('line-reader');

/* GET home page. */
router.get('/', function(req, res, next) {
  var key = req.query.q;
  if (!key) {
    return res.status(500).render('error', {
      error: new Error('?q={city,state}')
    });
  }
  key = key.toLowerCase();
  client.hgetall(key, function(err, val) {
    if (val) {
      return res.jsonp(val);
    } else {
      geocoder.geocode(key, function(err, data) {
        if (data) {
          var obj = {
            lat: data.results[0].geometry.location.lat,
            lon: data.results[0].geometry.location.lng
          };
          client.hmset(key, obj);
          res.jsonp(obj);
        } else {
          res.status(500);
          res.render('error', {
            error: err
          });
        }
      });
    }
  });
  // Geocoding
});

router.get('/seed', function(req, res, next) {
  lineReader.eachLine('./seed.csv', function(line, last) {
    var arr = line.split(',');
    var city = arr[0];
    var state = arr[1];
    var lat = arr[3];
    var lon = arr[4];
    console.log(JSON.stringify({
      city: city,
      state: state,
      lat: lat,
      lon: lon
    }));
    if (city && state && lat && lon) {
      var key = city.toLowerCase() + ', ' + state.toLowerCase();
      client.hmset(key, {
        lat: lat,
        lon: lon
      });
    }
    if (last) {
      res.send('done!');
    }
  });
})

module.exports = router;
