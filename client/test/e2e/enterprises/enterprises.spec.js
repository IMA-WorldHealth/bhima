/*global describe, it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');

describe('The Enterprises Module', function () {

  // shared methods
  var path = '#/enterprises';
  var ENTERPRISES = {
    name : 'Interchurch Medical Assistance',
    abbr : 'IMA', 
    email : 'ima@imaworldhealth.com', 
    po_box : 'POBOX USA 1', 
    phone : '01500', 
    currency_id : 1
  };

  function update(n) {
    return element(by.repeater("e in EnterpriseCtrl.enterprises | orderBy:'name'").row(n))
      .$$('a')
      .click();
  }

  // navigate to the enterprise module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('Successfully creates a new Enterprise', function () {
    FormUtils.buttons.create();

    FormUtils.input('EnterpriseCtrl.enterprise.name', ENTERPRISES.name);
    FormUtils.input('EnterpriseCtrl.enterprise.abbr', ENTERPRISES.abbr);
    FormUtils.input('EnterpriseCtrl.enterprise.email', ENTERPRISES.email);
    FormUtils.input('EnterpriseCtrl.enterprise.po_box', ENTERPRISES.po_box);
    FormUtils.input('EnterpriseCtrl.enterprise.phone', ENTERPRISES.phone);

    // select a random, non-disabled option
    FormUtils.select('EnterpriseCtrl.enterprise.location_id')
      .enabled()
      .first()
      .click();

    FormUtils.radio('EnterpriseCtrl.enterprise.currency_id', ENTERPRISES.currency_id);  
    // submit the page to the server
    FormUtils.buttons.submit();
  });


  it('Successfully edits an Enterprise', function () {
    element(by.id('enterprise-1')).click();
    element(by.model('EnterpriseCtrl.enterprise.name')).sendKeys('Enterprise UPDATED');
    element(by.model('EnterpriseCtrl.enterprise.abbr')).sendKeys('EnUpdt');
    element(by.id('change_enterprise')).click();
  });


  it('correctly blocks invalid form submission with relevent error classes', function () {
    element(by.id('create')).click();
    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-enterprise')).click();

    // The following fields should be required
    expect(element(by.model('EnterpriseCtrl.enterprise.name')).getAttribute('class')).to.eventually.contain('ng-invalid');
    expect(element(by.model('EnterpriseCtrl.enterprise.abbr')).getAttribute('class')).to.eventually.contain('ng-invalid');
    expect(element(by.model('EnterpriseCtrl.enterprise.location_id')).getAttribute('class')).to.eventually.contain('ng-invalid');
    expect(element(by.model('EnterpriseCtrl.enterprise.currency_id')).getAttribute('class')).to.eventually.contain('ng-invalid');

    // The following fields is not required
    expect(element(by.model('EnterpriseCtrl.enterprise.email')).getAttribute('class')).to.eventually.not.contain('ng-invalid');
    expect(element(by.model('EnterpriseCtrl.enterprise.po_box')).getAttribute('class')).to.eventually.not.contain('ng-invalid');
    expect(element(by.model('EnterpriseCtrl.enterprise.phone')).getAttribute('class')).to.eventually.not.contain('ng-invalid');

  });  

});
