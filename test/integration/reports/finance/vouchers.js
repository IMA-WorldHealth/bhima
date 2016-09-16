const RenderingTests = require('../rendering');
const target = '/reports/finance/vouchers';

describe(`(${target}) Voucher Report`, RenderingTests(target));
