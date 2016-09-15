/* global expect, chai, agent */
/* jshint expr : true */

const LazyReport = require('../lazy');
const target = '/reports/medical/patients';

describe(`(${target}) Patient Registrations`, LazyReport(target));
