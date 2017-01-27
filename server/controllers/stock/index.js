/**
 * @module stock/
 *
 * @description
 * The /stock HTTP API endpoint
 *
 * @description
 * This module is responsible for handling all crud operations relatives to stocks
 * and define all stock API functions 
 *
 *
 * @requires q
 * @requires lodash
 * @requires lib/node-uuid
 * @requires util
 * @requires lib/db
 * @requires lib/topic
 * @requires lib/node-uuid
 * @requires lib/errors/BadRequest
 * @requires lib/errors/NotFound
 *
 */

'use strict';

const _      = require('lodash');
const q      = require('q');
const uuid   = require('node-uuid');
const moment = require('moment');

const util   = require('../../../lib/util');
const db     = require('../../../lib/db');
const topic  = require('../../../lib/topic');

const BadRequest  = require('../../../lib/errors/BadRequest');
const NotFound    = require('../../../lib/errors/NotFound');