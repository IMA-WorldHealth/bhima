const RenderingTests = require('../rendering');
const target = '/reports/inventory/items';
describe(`(${target}) Inventory Report`, RenderingTests(target));
