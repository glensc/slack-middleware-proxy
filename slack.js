// SLACK INCOMING WEBHOOK PROXY, TAKE 1

// GET THE SERVER PORT FROM THE ENVIRONMENT OR USE A DEFAULT
var port = process.env.PORT || 5000;

// CREATE SERVER AND LISTEN FOR REQUESTS
console.log('Slack Proxy: Creating Server');
var http = require('http');
var server = http.createServer();
server.on('request',handleRequest);
server.listen(port);

// HANDLE A REQUEST
function handleRequest(request,response){

    console.log('Slack Proxy: Handle Request');

    // SET REQUEST AND RESPONSE ERROR HANDLERS
    request.on('error', function(err) {
        console.error("Error" + err);
        response.statusCode = 400;
        response.end();
    });
    response.on('error', function(err) {
        console.error("Error" + err);
    });

    // VALIDATE THE ORIGN DOMAIN AND BAIL IF NOT WHITE-LISTED
    // Aww snap...
    // Turns out this is a non-starter, because origin header can be spoofed easily.
    // Otherwise, this is a perfectly fine proxy, if you don't mind just ANYONE calling it.
    /*
        var origin = request.headers['origin'];
        .
        .
        .
    */

    // RECEIVE THE BODY OF THE REQUEST
    var body = [];
    request.on('data', function(chunk) {
        // PUSH A CHUNK
        body.push(chunk);
    }).on('end', function() {
        // REACHED THE END
        body = Buffer.concat(body).toString();

        // HANDLE ROUTES
        if (request.method === 'GET' && request.url === '/echo') {
            // ECHO DATA BACK (FOR TESTING THAT SERVER IS UP)
            handleEcho(body,response);
        } else if (request.method === 'POST' && request.url === '/') {
            // PARSE DATA AND SEND TO SLACK
            var payload;
            try {
                payload = JSON.parse(body);
            } catch (err) {
                response.write("Error: "+ err);
                response.end();
            }
            if (payload) sendSlackMessage(response, payload);
        } else {
            // UNSUPPORTED ROUTE
            response.statusCode = 404;
            response.end();
        }
    });
}

// ECHO THE REQUEST DATA ON THE RESPONSE
// curl -X GET -d 'Hello World' http://localhost:5000
function handleEcho(body,response){
    console.log('Slack Proxy: Handle Echo');
    response.statusCode = 200;
    response.end('\n'+body+'\n');
}

// SEND A SLACK MESSAGE WITH THE REQUEST DATA
// curl -X POST -d '{"channel": "#feedback", "username": "CliffBot5000", "text": "This is posted to channel #feedback.", "icon_emoji": ":ghost:"}' http://localhost:5000
function sendSlackMessage(response, payload){
    console.log('Slack Proxy: Handle Slack Message');

    // GET WEBHOOK URL FROM THE ENVIRONMENT
    var webhook = process.env['SLACK_WEBHOOK_URL']

    // IF WEBHOOK CONFIGURED AND PAYLOAD PRESENT, FIRE AT WILL
    if (webhook && payload) {

        // CREATE REQUEST MESSAGE
        var message = {
            uri: webhook,
            method: "POST",
            json:true,
            body:payload
        };

        // MAKE THE REQUEST
        console.log('Slack Proxy: Sending Slack message...');
        var slackReq = require("request");
        slackReq(message);
        response.statusCode = 200;
    } else {
        // REPORT ERROR IF WEBHOOK NOT CONFIGURED OR PAYLOAD NOT PRESENT
        response.statusCode = 500;
    }

    // ADIOS MUCHACHOS
    response.end();
}