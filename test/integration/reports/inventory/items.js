const RenderingTests = require('../rendering');

const target = '/reports/inventory/items';
describe(`test/integration${target} Inventory Report`, RenderingTests(target));
