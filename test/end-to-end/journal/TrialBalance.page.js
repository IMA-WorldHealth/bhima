const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

class TrialBalancePage {
  constructor() {
    this.overviewGridId = 'overview-grid';
    this.errorGridId = 'error-grid';
  }

  submit() {
    return TU.modal.submit();
  }

  cancel() {
    return TU.modal.cancel();
  }

  countOverviewRows() {
    return TU.locator(by.id(this.overviewGridId))
      .locator('.ui-grid-render-container-body')
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  countErrorRows() {
    return TU.locator(by.id(this.errorGridId))
      .locator('.ui-grid-render-container-body')
      .locator(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  goToErrorPage() {
    return TU.locator('[data-action="go-to-error-page"]').click();
  }

  goToOverviewPage() {
    return TU.locator('[data-action="go-to-overview-page"]').click();
  }

  // reference is account number
  async showAccountDetails(reference) {
    const link = await TU.locator(by.id(this.overviewGridId))
      .locator(`[data-row="${reference}"]`)
      .locator('[data-method="view-in-journal"]');
    return link.click();
  }
}

module.exports = TrialBalancePage;
