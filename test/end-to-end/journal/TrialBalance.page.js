/* global element, by */
const FU = require('../shared/FormUtils');

class TrialBalancePage {
  constructor() {
    this.overviewGridId = 'overview-grid';
    this.errorGridId = 'error-grid';

    this.buttons = {
      submit : FU.modal.submit,
      cancel : FU.modal.cancel,
      errors : $('[data-action="go-to-error-page"]'),
      overview : $('[data-action="go-to-overview-page"]'),
    };
  }

  submit() {
    return this.buttons.submit();
  }

  cancel() {
    return this.buttons.cancel();
  }

  countOverviewRows() {
    return element(by.id(this.overviewGridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  countErrorRows() {
    return element(by.id(this.errorGridId))
      .element(by.css('.ui-grid-render-container-body'))
      .all(by.repeater('(rowRenderIndex, row) in rowContainer.renderedRows track by $index'))
      .count();
  }

  goToErrorPage() {
    return this.buttons.errors.click();
  }

  goToOverviewPage() {
    return this.buttons.overview.click();
  }

  // reference is account number
  showAccountDetails(reference) {
    const link = element(by.id(this.overviewGridId))
      .$(`[data-row="${reference}"]`)
      .$('[data-method="view-in-journal"]');

    return link.click();
  }
}

module.exports = TrialBalancePage;
