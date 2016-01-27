/*global describe, it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');

describe('The Enterprises Module', function () {

  // shared methods
  var path = '#/enterprises';
  var ENTERPRISE = {
    name : 'Interchurch Medical Assistance',
    abbr : 'IMA', 
    email : 'ima@imaworldhealth.com', 
    po_box : 'POBOX USA 1', 
    phone : '01500', 
    currency_id : 1
  };

  var ENTERPRISE_ID = 1;
  // navigate to the enterprise module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('Successfully creates a new Enterprise', function () {
    FormUtils.buttons.create();

    FormUtils.input('EnterpriseCtrl.enterprise.name', ENTERPRISE.name);
    FormUtils.input('EnterpriseCtrl.enterprise.abbr', ENTERPRISE.abbr);
    FormUtils.input('EnterpriseCtrl.enterprise.email', ENTERPRISE.email);
    FormUtils.input('EnterpriseCtrl.enterprise.po_box', ENTERPRISE.po_box);
    FormUtils.input('EnterpriseCtrl.enterprise.phone', ENTERPRISE.phone);

    // select a random, non-disabled option
    FormUtils.select('EnterpriseCtrl.enterprise.location_id')
      .enabled()
      .first()
      .click();

    FormUtils.radio('EnterpriseCtrl.enterprise.currency_id', ENTERPRISE.currency_id);  
    // submit the page to the server
    FormUtils.buttons.submit();

    expect(element(by.id('create_success')).isPresent()).to.eventually.be.true;
  });


  it('Successfully edits an Enterprise', function () {
    element(by.id('enterprise-' + ENTERPRISE_ID )).click();
    element(by.model('EnterpriseCtrl.enterprise.name')).sendKeys('Enterprise UPDATED');
    element(by.model('EnterpriseCtrl.enterprise.abbr')).sendKeys('EnUpdt');
    element(by.id('change_enterprise')).click();

    expect(element(by.id('update_success')).isPresent()).to.eventually.be.true;
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
