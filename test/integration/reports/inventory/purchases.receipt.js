const RenderingTests = require('../rendering');
const target = '/reports/inventory/purchases/';
const purchaseUuid = 'e07ceadc-82cf-4ae2-958a-6f6a78c87588';
describe(`(${target}) Purchase Order Receipt`, RenderingTests(target + purchaseUuid));
