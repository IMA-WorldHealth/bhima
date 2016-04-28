var chai    = require('chai');
var expect  = chai.expect;

module.exports = {

  verify : function verify() {
    expect(element(by.css('[data-success-notification]')).isPresent()).to.eventually.equal(true);
  },

  dismiss : function dismiss() {
    // browser.driver.wait(protractor.until.elementIsVisible(element(by.css('[data-dismiss="notification"]'))));
    return element(by.css('[data-dismiss="notification"]')).click();
    // browser.ignoreSynchronization = false;
    // return t;
  }
};
