const RenderingTests = require('../rendering');

const target = '/reports/finance/accounts/chart';

describe(`test/integration${target} Chart of Accounts Report`, RenderingTests(target));
