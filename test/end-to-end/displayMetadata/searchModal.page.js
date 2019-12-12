/* eslint  */
/**
 * This class represents a modal search page
 * behaviour so it is a modal search page object
 */

const FU = require('../shared/FormUtils');
const components = require('../shared/components');

class SearchModalPage {
  surveyFormSelect(form) {
    return components.surveyFormSelect.set(form);
  }

  submit() {
    return FU.modal.submit();
  }
}

module.exports = SearchModalPage;
