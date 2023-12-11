const RenderingTests = require('../rendering');

const target = '/reports/medical/patients';

describe(`test/integration${target} Patients Registration Report`, RenderingTests(target));
