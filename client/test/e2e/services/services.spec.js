/*global describe, it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');

describe('The Projects Module', function () {
  // shared methods
  var path = '#/services';
  var SERVICE = {
    name : 'Zebra Service',
  };

  //To obtain the rank of a random element to the Service list
  function aleatoire(N) { 
    return (Math.floor((N)*Math.random()+1)); 
  }

  var DEFAULT_SERVICE = 4;
  var SERVICE_RANK = aleatoire(DEFAULT_SERVICE);
  console.log('SERVICE RANK',SERVICE_RANK);

  var DELETE_SUCCESS = 5;
  var DELETE_ERROR = 3;


  // navigate to the Service module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('Successfully creates a new Service', function () {
    FormUtils.buttons.create();

    FormUtils.input('ServicesCtrl.service.name', SERVICE.name);
    // select a random, Enterprise
    FormUtils.select('ServicesCtrl.service.enterprise_id')
      .enabled()
      .first()
      .click();

    // select a random, Cost Center 
    FormUtils.select('ServicesCtrl.service.cost_center_id')
      .enabled()
      .first()
      .click();

    // select a random, Profit center  
    FormUtils.select('ServicesCtrl.service.profit_center_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FormUtils.buttons.submit();

    expect(element(by.id('create_success')).isPresent()).to.eventually.be.true;
  });


  it('Successfully edits an Service', function () {
    element(by.id('service-upd-' + SERVICE_RANK )).click();
    element(by.model('ServicesCtrl.service.name')).sendKeys('Updated');
    element(by.id('change_service')).click();

    expect(element(by.id('update_success')).isPresent()).to.eventually.be.true;
  });

  it('correctly blocks invalid form submission with relevent error classes', function () {
    element(by.id('create')).click();
    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-service')).click();

    // The following fields should be required
    expect(element(by.model('ServicesCtrl.service.name')).getAttribute('class')).to.eventually.contain('ng-invalid');
    expect(element(by.model('ServicesCtrl.service.enterprise_id')).getAttribute('class')).to.eventually.contain('ng-invalid');

    // The following fields is not required
    expect(element(by.model('ServicesCtrl.service.cost_center_id')).getAttribute('class')).to.eventually.not.contain('ng-invalid');
    expect(element(by.model('ServicesCtrl.service.profit_center_id')).getAttribute('class')).to.eventually.not.contain('ng-invalid');
  });  

  it('Successfully delete an Service', function () {
    element(by.id('service-del-' + DELETE_SUCCESS )).click();
    browser.switchTo().alert().accept();
    expect(element(by.id('delete_success')).isPresent()).to.eventually.be.true;
  });

  it('No way to delete a Service', function () {
    element(by.id('service-del-' + DELETE_ERROR )).click();
    browser.switchTo().alert().accept();
    expect(element(by.id('delete_error')).isPresent()).to.eventually.be.true;
  });

  it('Cancellation of removal process of a Service', function () {
    element(by.id('service-del-' + DELETE_ERROR )).click();
    browser.switchTo().alert().dismiss();
    expect(element(by.id('default')).isPresent()).to.eventually.be.true;
  });

});
