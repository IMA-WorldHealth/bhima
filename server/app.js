var express       = require('express'),
    https         = require('https'),
    fs            = require('fs');

// Temporary switch between production and development
// TODO -- in the future, this should be done via environmental
// variablesk
var MODE          = (process.argv[2]) ? process.argv[2] : 'production';
var config        = require('./config/environment/' + MODE);
process.env.NODE_ENV = MODE; // allow other modules to check the environment

// SSL credentials
var privateKey  = fs.readFileSync(config.tls.key, 'utf8');
var certificate = fs.readFileSync(config.tls.cert, 'utf8');
var credentials = { key : privateKey, cert : certificate };
var db          = require('./lib/db').initialise(config.db);

var app = express();

// Configure application middleware stack, inject authentication session
require('./config/express').configure(app);

// Link routes
require('./config/routes').configure(app);

// link error hanlding
require('./config/express').errorHandling(app);

// Load and configure plugins
require('./lib/pluginManager')(app, config.plugins);

// start the server
https.createServer(credentials, app).listen(config.port, logApplicationStart);

process.on('uncaughtException', forceExit);

function logApplicationStart() {
  console.log('[app] BHIMA server started in mode %s on port %s.', MODE.toUpperCase(), config.port);
}

function forceExit(err) {
  console.error('[uncaughtException]', err, err.message);
  console.error(err.stack);
  process.exit(1);
}
