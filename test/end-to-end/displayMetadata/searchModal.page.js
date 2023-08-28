const TU = require('../shared/TestUtils');

const components = require('../shared/components');

/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

class SearchModalPage {
  surveyFormSelect(form) {
    return components.surveyFormSelect.set(form);
  }

  submit() {
    return TU.modal.submit();
  }
}

module.exports = SearchModalPage;
