var geocoder = require('geocoder');

  // Geocoding
  geocoder.geocode("Atlanta, GA", function ( err, data ) {
    console.log(data.results[0].geometry.location);
  });
