var config = require('./config.json');
var https = require('https');
var crypto = require('crypto');

// See http://msdn.microsoft.com/library/azure/dn170477.aspx
function create_sas_token(uri, key_name, key)
{
    // Token expires in 24 hours
    var expiry = Math.floor(new Date().getTime()/1000+3600*24);

    var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;
    var hmac = crypto.createHmac('sha256', key);
    hmac.update(string_to_sign);
    var signature = hmac.digest('base64');
    var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + key_name;

    return token;
}

// See http://blog.tompawlak.org/how-to-generate-random-values-nodejs-javascript
function random (howMany, chars) {
    chars = chars         
		|| "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";
    var rnd = crypto.randomBytes(howMany)
        , value = new Array(howMany)
        , len = chars.length;

    for (var i = 0; i < howMany; i++) {
        value[i] = chars[rnd[i] % len]
    };

    return value.join('');
}

// Payload to send
var payload = JSON.stringify({
	sensor: 'temp-f',
	sensorid: 'out-therm-' + random(1, config.sensors.allowedChars),
	value: Math.round((Math.random() * (config.sensors.temperature.maxValue - config.sensors.temperature.minValue) + config.sensors.temperature.minValue) * 1000) / 1000
});

// Full Event Hub publisher URI
var eventHubUri = 'https://' + config.serviceBus.namespace + '.servicebus.windows.net/' + config.serviceBus.EventHub + '/messages';

// Create a SAS token
var sasToken = create_sas_token(eventHubUri, config.serviceBus.sharedAccessKey.name, config.serviceBus.sharedAccessKey.secret)
console.log(sasToken);

// Send the request to the Event Hub
var options = {
  hostname: config.serviceBus.namespace + '.servicebus.windows.net',
  port: 443,
  path: '/' + config.serviceBus.EventHub + '/messages',
  method: 'POST',
  headers: {
    'Authorization': sasToken,
    'Content-Length': payload.length,
    'Content-Type': 'application/atom+xml;type=entry;charset=utf-8'
  }
};
var request = https.request(options, function(response) {
  console.log("statusCode: ", response.statusCode);
  console.log("headers: ", response.headers);

  response.on('data', function(d) {
    process.stdout.write(d);
  });
});
request.on('error', function(e) {
  console.error(e);
});
request.write(payload);
request.end();