/**
 * @overview
 * This controller uses the topic library to broadcast events to the client
 * along a server-sent events channel.  It includes two channels:
 *  1. `/stream` for real-time event broadcasts.
 *  2. `/events` for listing all events in the last day
 *
 * @requires lib/db
 * @requires lib/topic
 */

'use strict';

const db = require('../lib/db');
const topic = require('../lib/topic');

// GET /stream
exports.stream = stream;

// GET /events
exports.list = list;

// event stream to be set to the client
function stream(req, res) {

  // ensure the socket hangs open forever
  res.set('Content-Type', 'text/event-stream');
  res.set('Content-Control', 'no-cache');

  // this listener publishes events to the client as server-sent events
  function listener(data) {
    res.write(`data: ${JSON.stringify(data)}\n\n`).flush();
  }

  // listen for server events and echo them to the client
  topic.subscribe(topic.channels.ALL, listener);

  // remove listener on when the client closes the connection
  res.on('close', () => topic.unsubscribe(topic.channels.ALL, listener));
}

// list the events in the database
function list(req, res, next) {
  let sql = `
    SELECT  event.data FROM event LIMIT 500;
  `;

  db.exec(sql)
  .then(rows => {
    let events = rows.map(row => JSON.parse(row.data));
    res.status(200).json(events);
  })
  .catch(next)
  .done();
}
