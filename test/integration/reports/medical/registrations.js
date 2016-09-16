const RenderingTests = require('../rendering');
const target = '/reports/medical/patients';

describe(`(${target}) Patient Registrations`, RenderingTests(target));
