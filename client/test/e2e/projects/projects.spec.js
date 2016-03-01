/* jshint expr:true */
/* global element, by, beforeEach, inject, browser */

var chai = require('chai');
var expect = chai.expect;

var FU = require('../shared/FormUtils');
var helpers = require('../shared/helpers');

helpers.configure(chai);

describe('Projects Module', function () {
  'use strict';

  var path = '#/projects';
  var project = {
    name : 'Test Project D',
    abbr : 'TPD'
  };

  var defaultProject = 3;
  var enterpriseRank = helpers.random(defaultProject);
  var deleteSuccess = 4;
  var deleteError = 1;

  // navigate to the project module before each test
  beforeEach(function () {
    browser.get(path);
  });

  it('successfully creates a new project', function () {

    // swtich to the create form
    FU.buttons.create();

    FU.input('ProjectCtrl.project.name', project.name);
    FU.input('ProjectCtrl.project.abbr', project.abbr);

    // select an enterprise
    FU.select('ProjectCtrl.project.enterprise_id')
      .enabled()
      .first()
      .click();

    // select a health zone (zone de sante)
    FU.select('ProjectCtrl.project.zs_id')
      .enabled()
      .first()
      .click();

    // submit the page to the server
    FU.buttons.submit();

    // expect a nice validation message
    FU.exists(by.id('create_success'), true);
  });


  it('successfully edits an project', function () {

    element(by.id('project-upd-' + enterpriseRank )).click();

    // modify the project name
    FU.input('ProjectCtrl.project.name', 'Updated');

    element(by.id('bhima-project-locked')).click();
    element(by.id('change_project')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });

  it('successfully unlock an project', function () {
    element(by.id('project-upd-' + enterpriseRank )).click();

    element(by.id('change_project')).click();

    // make sure the success message appears
    FU.exists(by.id('update_success'), true);
  });


  it('correctly blocks invalid form submission with relevant error classes', function () {

    // switch to the create form
    element(by.id('create')).click();

    // Verify form has not been successfully submitted
    expect(browser.getCurrentUrl()).to.eventually.equal(browser.baseUrl + path);

    element(by.id('submit-project')).click();

    // the following fields should be required
    FU.validation.error('ProjectCtrl.project.name');
    FU.validation.error('ProjectCtrl.project.abbr');
    FU.validation.error('ProjectCtrl.project.enterprise_id');
    FU.validation.error('ProjectCtrl.project.zs_id');

    // the following fields are not required
    FU.validation.ok('ProjectCtrl.project.locked');
  });

  it('successfully delete an project', function () {
    element(by.id('project-del-' + deleteSuccess )).click();

    // click the alert asking for permission
    browser.switchTo().alert().accept();

    // make sure that the delete message appears
    FU.exists(by.id('delete_success'), true);
  });

  it('does not delete a project that has foreign key conditions', function () {

    // try to delete an element that is used in other tables
    element(by.id('project-del-' + deleteError)).click();

    // accept the alert
    browser.switchTo().alert().accept();

    // the module should show an error message (and none others)
    FU.exists(by.id('delete_error'), true);
    FU.exists(by.id('default'), false);
    FU.exists(by.id('delete_success'), false);
  });

  it('cancellation of removal process of a project', function () {

    // click the remove a project
    element(by.id('project-del-' + deleteError )).click();

    // reject the alert that appears
    browser.switchTo().alert().dismiss();

    // make sure that we have the default interface (and no others)
    FU.exists(by.id('default'), true);
    FU.exists(by.id('delete_success'), false);
    FU.exists(by.id('delete_error'), false);
  });
});
