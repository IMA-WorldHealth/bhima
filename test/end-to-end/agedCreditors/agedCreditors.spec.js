/* global browser, element, by */

const chai = require('chai');
const expect = chai.expect;

const components = require('../shared/components');
const FU = require('../shared/FormUtils');
const helpers = require('../shared/helpers');
const GU = require('../shared/GridUtils');

helpers.configure(chai);

describe('Aged Creditors Report', () => {
  function getInvoiceNumber(gridId) {
    return GU.getRows(gridId).count();
  }
  const numReports = 1;

  before(() => helpers.navigate('#!/reports/agedCreditors'));

  // TODO client side report removed, required update for server PDF success
  it('GET /reports/agedCreditors Create a new Report of Aged Debts', () => {
    const date = new Date('12-31-2017');
    element(by.id('create-report')).click();

    FU.input('ReportConfigCtrl.label', 'Report Debts of December 31, 2017');
    components.dateEditor.set(date, null, '[ng-model="ReportConfigCtrl.label"]');

    // focus on the button zone
    FU.modal.submit();
    expect(getInvoiceNumber('report-grid')).to.eventually.equal(numReports);
  });
});
