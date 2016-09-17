const RenderingTests = require('../rendering');
const target = '/reports/finance/accounts/chart';

describe(`(${target}) Chart of Accounts`, RenderingTests(target));
