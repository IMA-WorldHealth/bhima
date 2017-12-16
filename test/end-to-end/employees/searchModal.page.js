/* global element, by */

/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class SearchModalPage {
  setDisplayName(displayName) {
    FU.input('ModalCtrl.searchQueries.display_name', displayName);
  }

  submit() {
    FU.modal.submit();
  }

  selectSex(sex) {
    return element(by.id(`${sex}`)).click();
  }

  setRegistrationDateRange(range) {
    return $('[date-id="embauche-date"]').$(`[data-date-range="${range}"]`).click();
  }

  selectService(service) {
    components.serviceSelect.set(service);
  }

  selectGrade(grade) {
    components.gradeSelect.set(grade);
  }

  selectFonction(fonction) {
    components.fonctionSelect.set(fonction);
  }
}

module.exports = SearchModalPage;
