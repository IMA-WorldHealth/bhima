var express       = require('express'),
    https         = require('https'),
    fs            = require('fs');

// warn the user if the process does not have a NODE_ENV variable configured
if (!process.env.NODE_ENV) {
  console.warn('[WARN] No NODE_ENV environmental variables found. Using \'production\'.');
  process.env.NODE_ENV = 'production';
}

// normalize the environmental variable name
var env = process.env.NODE_ENV.toLowerCase();

// decode the file path for the environmental variables.
var fPath = 'server/.env.{env}'.replace('{env}', env);

// load the environmnetal variables into process using the dotenv module
try {
  console.log('[app] Loading configuration from file: %s', fPath);
  require('dotenv').config({ path : fPath.toString().trim() });
} catch (e) {
  console.error(
    '[ERROR] Configuration file could not be found in path: %s.',
    'Please ensure that you have the correct NODE_ENV variable set',
    'or that the file exists.',
    fPath
  );

  // crash the process - the app cannot continue without a proper configuration
  throw e;
}

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
https.createServer(credentials, app)
  .listen(process.env.PORT, logApplicationStart);

process.on('uncaughtException', forceExit);

function logApplicationStart() {
  console.log('[app] BHIMA server started in mode \'%s\' on port %s.', process.env.NODE_ENV.toLowerCase(), process.env.PORT);
}

function forceExit(err) {
  console.error('[uncaughtException]', err.message);
  console.error(err.stack);
  process.exit(1);
}
