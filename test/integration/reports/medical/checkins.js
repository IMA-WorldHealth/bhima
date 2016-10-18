const RenderingTests = require('../rendering');
const patientUuid = '274c51ae-efcc-4238-98c6-f402bfb39866';
const target = `/reports/medical/patients/${patientUuid}/checkins`;

describe(`(${target}) Patient Checkin Report`, RenderingTests(target));
