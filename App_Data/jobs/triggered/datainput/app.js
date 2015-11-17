var config = require('./config.json');
var https = require('https');
var crypto = require('crypto');

var iteration = 0;

// See http://msdn.microsoft.com/library/azure/dn170477.aspx
function createToken(uri, name, key) {
    // Token expires in 24 hours
    var expiry = Math.floor(new Date().getTime()/1000+3600*24);

    var string_to_sign = encodeURIComponent(uri) + '\n' + expiry;
    var hmac = crypto.createHmac('sha256', key);
    hmac.update(string_to_sign);
    var signature = hmac.digest('base64');
    var token = 'SharedAccessSignature sr=' + encodeURIComponent(uri) + '&sig=' + encodeURIComponent(signature) + '&se=' + expiry + '&skn=' + name;

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

function sendEvent(sasToken, eventHubUri) {
    
  // Payload to send
  var payload = JSON.stringify({
  	sensor: 'temp-f',
  	sensorid: 'out-therm-' + random(1, config.sensors.allowedChars),
  	value: Math.round((Math.random() * (config.sensors.temperature.maxValue - config.sensors.temperature.minValue) + config.sensors.temperature.minValue) * 1000) / 1000
  });
  
  // Create HTTP options
  var options = {
    hostname: config.serviceBus.namespace + '.servicebus.windows.net',
    port: 443,
    path: '/' + config.serviceBus.eventHub + '/messages',
    method: 'POST',
    headers: {
      'Authorization': token,
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
  
  console.log(payload);
  request.write(payload);
  
  // Close Request
  request.end();
}

//Loop and send events
function processLoop(sasToken, eventHubUri) {
  var intervalId = setInterval(function() {    
    if (iteration++ >= config.messageCount) {
      clearInterval(intervalId);
    }
    sendEvent(sasToken, eventHubUri)
  }, config.delayBetweenMessages);
}

// Full Event Hub publisher URI
var uri = 'https://' + config.serviceBus.namespace + '.servicebus.windows.net/' + config.serviceBus.eventHub + '/messages';

// Create a SAS token
var token = createToken(uri, config.serviceBus.sharedAccessKey.name, config.serviceBus.sharedAccessKey.secret)

// Send the requests to the Event Hub
processLoop(token, uri);
