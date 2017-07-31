const helpers = require('../shared/helpers');

const PurchaseOrderSearch = require('./registry.search');

// purchase order registry tests
describe('Purchase Order Registry', function () {
  'use strict';

  before(() => helpers.navigate('#/purchases/list'));

  // Purchase Order search modal queries
  describe('Search', PurchaseOrderSearch);
});
