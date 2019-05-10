/* global element, by */
/* eslint  */

/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class SearchModalPage {
  setDisplayName(displayName) {
    return FU.input('ModalCtrl.searchQueries.display_name', displayName);
  }

  setReference(reference) {
    return FU.input('ModalCtrl.searchQueries.reference', reference);
  }

  submit() {
    return FU.modal.submit();
  }

  selectSex(sex) {
    return element(by.id(`${sex}`)).click();
  }

  setRegistrationDateRange(range) {
    return $('[date-id="embauche-date"]').$(`[data-date-range="${range}"]`).click();
  }

  selectService(service) {
    return components.serviceSelect.set(service);
  }

  selectGrade(grade) {
    return components.gradeSelect.set(grade);
  }

  selectFonction(fonction) {
    return components.fonctionSelect.set(fonction);
  }
}

module.exports = SearchModalPage;
