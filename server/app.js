var express       = require('express'),
    https         = require('https'),
    fs            = require('fs');

// switch for environmental variables
var env = (process.env.NODE_ENV === 'production') ?
  'server/.env.production' :
  'server/.env.development';

// load the environmnetal variables into process
require('dotenv').config({ path : env });

// SSL credentials
var privateKey  = fs.readFileSync(process.env.TLS_KEY, 'utf8');
var certificate = fs.readFileSync(process.env.TLS_CERT, 'utf8');
var credentials = { key : privateKey, cert : certificate };

// configure the database for use within the application
require('./lib/db').initialise();

var app = express();

// Configure application middleware stack, inject authentication session
require('./config/express').configure(app);

// Link routes
require('./config/routes').configure(app);

// link error hanlding
require('./config/express').errorHandling(app);

// Load and configure plugins
// TODO - find a better way to load in a list of plugins
require('./lib/pluginManager')(app, []);

// start the server
https.createServer(credentials, app).listen(process.env.PORT, logApplicationStart);

process.on('uncaughtException', forceExit);

function logApplicationStart() {
  console.log('[app] BHIMA server started in mode %s on port %s.', process.env.NODE_ENV.toUpperCase(), process.env.PORT);
}

function forceExit(err) {
  console.error('[uncaughtException]', err, err.message);
  console.error(err.stack);
  process.exit(1);
}
