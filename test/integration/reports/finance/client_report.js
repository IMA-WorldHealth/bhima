/* global expect, chai, agent */
/* jshint expr: true */
'use strict';

const RenderingTests = require('../rendering');
const target = '/reports/finance/clientsReport';

const params = {
  label : 'client test report',
  dateFrom: '2016-01-01',
  dateTo: '2016-12-31',
  lang : 'fr',
  currency_id : 2,
  detailPrevious : true
};

describe(`(${target}) clients report`, RenderingTests(target, null, params));

