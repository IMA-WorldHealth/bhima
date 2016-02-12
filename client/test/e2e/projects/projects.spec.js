/*global describe, it, element, by, beforeEach, inject, browser */

var chai = require('chai');
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var expect = chai.expect;

var FormUtils = require('../shared/FormUtils');

describe('The Projects Module', function () {
  // shared methods
  var path = '#/projects';
  var PROJECT = {
    name : 'Test Project D',
    abbr : 'TPD'
  };

  //To obtain the rank of a random element to the project list
  function aleatoire(N) { 
    return (Math.floor((N)*Math.random()+1)); 
  }

  var DEFAULT_PROJECT = 3;
  var ENTERPRISE_RANK = aleatoire(DEFAULT_PROJECT);
  var DELETE_SUCCESS = 4;
  var DELETE_ERROR = 1;


  // navigate to the project module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('Successfully creates a new Project', function () {
    FormUtils.buttons.create();

    FormUtils.input('ProjectCtrl.project.name', PROJECT.name);
    FormUtils.input('ProjectCtrl.project.abbr', PROJECT.abbr);
    // select a random, Enterprise
    FormUtils.select('ProjectCtrl.project.enterprise_id')
      .enabled()
      .first()
      .click();

    // select a random, Zone de sante
    FormUtils.select('ProjectCtrl.project.zs_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FormUtils.buttons.submit();

    expect(element(by.id('create_success')).isPresent()).to.eventually.be.true;
  });


  it('Successfully edits an Project', function () {
    element(by.id('project-upd-' + ENTERPRISE_RANK )).click();
    element(by.model('ProjectCtrl.project.name')).sendKeys('Updated');
    element(by.id('bhima-project-locked')).click();
    element(by.id('change_project')).click();

    expect(element(by.id('update_success')).isPresent()).to.eventually.be.true;
  });

  it('Successfully Unlock an Project', function () {
    element(by.id('project-upd-' + ENTERPRISE_RANK )).click();
    element(by.id('change_project')).click();

    expect(element(by.id('update_success')).isPresent()).to.eventually.be.true;
  });


  it('correctly blocks invalid form submission with relevent error classes', function () {
    element(by.id('create')).click();
    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-project')).click();

    // The following fields should be required
    expect(element(by.model('ProjectCtrl.project.name')).getAttribute('class')).to.eventually.contain('ng-invalid');
    expect(element(by.model('ProjectCtrl.project.abbr')).getAttribute('class')).to.eventually.contain('ng-invalid');
    expect(element(by.model('ProjectCtrl.project.enterprise_id')).getAttribute('class')).to.eventually.contain('ng-invalid');
    expect(element(by.model('ProjectCtrl.project.zs_id')).getAttribute('class')).to.eventually.contain('ng-invalid');

    // The following fields is not required
    expect(element(by.model('ProjectCtrl.project.locked')).getAttribute('class')).to.eventually.not.contain('ng-invalid');
  });  

  it('Successfully delete an Project', function () {
    element(by.id('project-del-' + DELETE_SUCCESS )).click();
    browser.switchTo().alert().accept();
    expect(element(by.id('delete_success')).isPresent()).to.eventually.be.true;
  });

  it('No way to delete a project', function () {
    element(by.id('project-del-' + DELETE_ERROR )).click();
    browser.switchTo().alert().accept();
    expect(element(by.id('delete_error')).isPresent()).to.eventually.be.true;
  });

  it('Cancellation of removal process of a project', function () {
    element(by.id('project-del-' + DELETE_ERROR )).click();
    browser.switchTo().alert().dismiss();
    expect(element(by.id('default')).isPresent()).to.eventually.be.true;
  });

});
