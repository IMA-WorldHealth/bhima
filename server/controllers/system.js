/**
 * @overview
 * This controller uses the Topic library to broadcast events to the client
 * along a server-sent events channel.  It includes two channels:
 *  1. `/stream` for real-time event broadcasts.
 *  2. `/events` for eventsing all events in the last day
 *
 * @requires os
 * @requires lib/db
 * @requires lib/topic
 */

'use strict';

const os = require('os');
const db = require('../lib/db');
const Topic = require('../lib/topic');
const pkg = require('../../../package.json');

// GET system/stream
exports.stream = stream;

// GET system/events
exports.events = events;

// GET system/info
exports.info = info;

// event stream to be set to the client
function stream(req, res) {

  // ensure the socket hangs open forever
  res.set('Content-Type', 'text/event-stream');
  res.set('Content-Control', 'no-cache');

  // this listener publishes events to the client as server-sent events
  function eventsener(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`).flush();
  }

  // listener for server events and echo them to the client
  Topic.subscribe(Topic.channels.ALL, eventsener);

  // remove listener on when the client closes the connection
  res.on('close', () => Topic.unsubscribe(Topic.channels.ALL, eventsener));
}

// events the events in the database
function events(req, res, next) {
  let sql = `
    SELECT event.data FROM event LIMIT 500;
  `;

  db.exec(sql)
  .then(rows => {
    let events = rows.map(row => JSON.parse(row.data));
    res.status(200).json(events);
  })
  .catch(next)
  .done();
}

// send operating system information
function info(req, res) {

  // platform information string
  const platformString = `${os.platform()}-${os.arch()}-${os.release()}`;

  // data to be returned to the client
  const data = {
    platform : platformString,
    numCPUs : os.cpus().length,
    machineUptime : os.uptime() * 1000,       // change to milliseconds
    processUptime : process.uptime() * 1000,  // change to milliseconds
    memoryUsage : 1 - (os.freemem() / os.totalmem()),
    version : pkg.version
  };

  // respond with the system statistics
  res.status(200).json(data);
}
