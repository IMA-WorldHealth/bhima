const RenderingTests = require('../rendering');

const target = '/reports/finance/employee_standing';
const params = { employee_uuid : '75e09694-65f2-45a1-a8a2-8b025003d793' };
describe(`(${target}) Employee Standing Report`, RenderingTests(target, null, params));
