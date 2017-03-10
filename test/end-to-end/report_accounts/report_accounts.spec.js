/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const GU = require('../shared/GridUtils');
helpers.configure(chai);

describe.skip('Report Accounts generator', () => {

  function getInvoiceNumber(gridId) {
    return GU.getRows(gridId).count();
  }
  const numReports = 1;

  before(() => helpers.navigate('#/reports/report_accounts'));

  // TODO client side report removed, required update for server PDF success
  it('GET /reports/report_accounts Create a new Report of an Account', () => {
    FU.buttons.create();

    FU.input('ReportConfigCtrl.label', 'Report of Account 41003');
	components.accountSelect.set('41003');
    FU.select('ReportConfigCtrl.source',  'Tous');

    // focus on the button zone
    FU.buttons.submit();

    expect(getInvoiceNumber('report-grid')).to.eventually.equal(numReports);
  });
});
