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
  detailPrevious : true
};

describe.only(`(${target}) clients report`, RenderingTests(target, null, params));

