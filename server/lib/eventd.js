/**
 * @overview
 * This library is responsible for constructing and exposing the Eventd class
 * to server methods.  Since NodeJS modules are singletons, there will only ever
 * exist a single Eventd instance that all modules can subscribe to.
 *
 * The Eventd class is a simple event emitter that capture event emissions,
 * attaches a timestamp and defers the callback for performance reasons.
 *
 * The Eventd is also responsible for writing event logs to the database.
 *
 * @todo eventually this should use redis for pub/sub to scale to multi-server
 * or multi-core machines.
 *
 * @todo refine the ideas of channels, events, and entities to something that
 * can be easily localized and used.
 *
 * @requires db
 * @requires EventEmitter
 * @requires winston
 */
'use strict';

const db = require('./db');
const EventEmitter = require('events');
const winston = require('winston');

// event constants
const events = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  REPORT: 'report',
  LOGIN: 'login',
  LOGOUT: 'logout',
};

// event entities
const entities = {
  PATIENT : 'patient',
  INVOICE : 'invoice',
  PAYMENT : 'payment',
  VOUCHER : 'voucher',
  PATIENT_GROUP : 'patient group',
  DEBTOR_GROUP : 'debtor_group',
  EMPLOYEE : 'employee',
  USER : 'user',
  PERMISSION : 'permission',
};

// event channels
const channels = {
  ALL: 'all',
  APP: 'app',
  MEDICAL: 'medical',
  FINANCE: 'finance'
};

// writes events into the event database table
function databaseLogger(data) {
  let record = {
    timestamp: new Date(data.timestamp),
    user_id: data.user_id,
    channel: data.channel,
    type: data.event,
    data: JSON.stringify(data)
  };
  db.exec('INSERT INTO event SET ?', [record])
  .catch(err => winston.error(err))
  .done();
}

/**
 * @class Eventd
 *
 * @description
 * A singleton class for echoing events throughout the server backbone.  It is
 * designed to be imported into controllers and used when significant events
 * occur.
 *
 * This aliases many of the underlying event emitter methods with pub/sub
 * method names in anticipation of going to a Redis-based event architecture.
 * See the TODO at the top of this module.
 */
class Eventd extends EventEmitter {
  constructor() {
    super();

    // register the database logger
    this.subscribe(channels.ALL, databaseLogger);
  }

  // NOTE: setImmediate() is makes the event(s) asynchronous
  publish(channel, data) {
    data.timestamp = new Date();
    data.channel = channel;

    // skip if broadcasting on the ALL channel (we do this by default anyway)
    if (channel !== channels.ALL) {
      setImmediate(() => super.emit(channel, data));
    }

    // broadcast on the ALL channel for global listeners
    setImmediate(() => super.emit(channels.ALL, data));
  }

  // alias EventEmitter.on()
  subscribe(channel, callback) {
    super.on(channel, callback);
  }

  // alias EventEmitter.removeListener()
  unsubscribe(channel, callback) {
    super.removeListener(channel, callback);
  }

  // event constants for emitters to consume (defined above)
  get events() {
    return events;
  }

  // possible channels to subscribe to using eventd.on()
  get channels() {
    return channels;
  }

  get entities() {
    return entities;
  }
}

// expose the event emitter
module.exports = new Eventd();
