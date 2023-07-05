const TU = require('../shared/TestUtils');
const { by } = require('../shared/TestUtils');

const components = require('../shared/components');

/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

class SearchModalPage {
  setDisplayName(displayName) {
    return TU.input('ModalCtrl.searchQueries.display_name', displayName);
  }

  setReference(reference) {
    return TU.input('ModalCtrl.searchQueries.reference', reference);
  }

  async submit() {
    await TU.modal.submit();
    return TU.waitForSelector('div.ui-grid-footer', { waitUntil : 'domcontentloaded' });
  }

  selectSex(sex) {
    return TU.locator(by.id(`${sex}`)).click();
  }

  setRegistrationDateRange(range) {
    return TU.locator(`[date-id="embauche-date"] [data-date-range="${range}"]`).click();
  }

  selectService(service) {
    return components.serviceSelect.set(service);
  }

  selectGrade(grade) {
    return components.gradeSelect.set(grade);
  }

  selectFunction(fonction) {
    return components.functionSelect.set(fonction);
  }

}

module.exports = SearchModalPage;
